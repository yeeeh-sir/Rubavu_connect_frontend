import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Radio, Send, Eye, Flag, X, Camera, CameraOff, Mic, MicOff, MonitorPlay, Video } from 'lucide-react';
import { getActiveLives, joinLive, leaveLive, endLive, startLive, getLiveComments, reportLive } from '../api/live';
import { connectSocket } from '../utils/socket';
import { getErrorMessage, formatCount } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/UserAvatar';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Loading from '../components/Loading';

export default function LivePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lives, setLives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [isCreator, setIsCreator] = useState(false);
  const [cameraState, setCameraState] = useState('idle');
  const [micMuted, setMicMuted] = useState(false);
  const [frameSrc, setFrameSrc] = useState(null);
  const [showStart, setShowStart] = useState(false);
  const [title, setTitle] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [starting, setStarting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showReport, setShowReport] = useState(false);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const frameIntervalRef = useRef(null);
  const canvasRef = useRef(null);
  const lastFrameAtRef = useRef(0);
  const commentsEndRef = useRef(null);

  const loadLives = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getActiveLives();
      setLives(res.data.data.lives || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load live sessions'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLives();
    return () => {
      stopCamera();
      stopFrameRelay();
      socketRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadLives]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [comments, viewerCount]);

  const stopCamera = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    setCameraState('idle');
  }, []);

  const startCamera = useCallback(async () => {
    if (localStreamRef.current) return true;
    setCameraState('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      localStreamRef.current = stream;
      setCameraState('active');
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return true;
    } catch (err) {
      setCameraState('denied');
      return false;
    }
  }, []);

  const toggleCamera = async () => {
    const stream = localStreamRef.current;
    const active = stream?.getVideoTracks().some((t) => t.enabled);
    stream?.getVideoTracks().forEach((t) => {
      t.enabled = !active;
    });
    if (!stream || !active) {
      await startCamera();
    }
  };

  const toggleMic = () => {
    const stream = localStreamRef.current;
    const nextMuted = !micMuted;
    stream?.getAudioTracks().forEach((t) => {
      t.enabled = !nextMuted;
    });
    setMicMuted(nextMuted);
  };

  const getCanvas = () => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    return canvasRef.current;
  };

  const startFrameRelay = useCallback(() => {
    stopFrameRelay();
    const canvas = getCanvas();
    const ctx = canvas.getContext('2d');
    frameIntervalRef.current = setInterval(() => {
      const video = localVideoRef.current;
      if (!video || video.readyState < 2) return;
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 360;
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
      ctx.drawImage(video, 0, 0, width, height);
      const frame = canvas.toDataURL('image/jpeg', 0.4);
      socketRef.current?.emit('live:frame', { live_id: viewing.id, frame });
    }, 250);
  }, [stopFrameRelay, viewing?.id]);

  function stopFrameRelay() {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
  }

  const enterLive = async (session) => {
    setViewing(session);
    setComments([]);
    setCommentText('');
    setFrameSrc(null);
    setIsCreator(user.id === session.creator_id);
    setViewerCount(session.viewer_count || 0);

    const token = localStorage.getItem('token');
    const socket = connectSocket(token);
    socketRef.current = socket;

    try {
      if (!socket.connected) {
        await new Promise((resolve) => {
          socket.once('connect', resolve);
        });
      }
      socket.emit('live:join', session.id);
    } catch (_) {}
    socket.on('live:comment', (comment) => {
      if (comment.live_session_id === session.id) {
        setComments((prev) => [...prev, comment]);
      }
    });
    socket.on('live:viewer_count', (data) => {
      if (data.live_id === session.id) {
        setViewerCount(data.viewer_count);
      }
    });
    socket.on('live:viewer_joined', (viewer) => {
      if (viewer.user_id !== user.id) {
        setViewerCount((c) => c + 1);
      }
    });
    socket.on('live:frame', (data) => {
      if (data.live_id === session.id) {
        const now = Date.now();
        if (now - lastFrameAtRef.current > 150) {
          lastFrameAtRef.current = now;
          setFrameSrc(data.frame);
        }
      }
    });
    socket.on('live:ended', (data) => {
      if (data.live_id === session.id) {
        setViewing(null);
        loadLives();
      }
    });

    try {
      const [commentsRes] = await Promise.all([getLiveComments(session.id, 1, 50)]);
      setComments(commentsRes.data.data.comments || []);
      if (!isCreator) await joinLive(session.id);
    } catch (_) {}

    if (session.creator_id === user.id) {
      setCameraState((state) => (localStreamRef.current ? 'active' : state));
      await startCamera();
      if (localStreamRef.current) {
        startFrameRelay();
      }
    }
  };

  const sendComment = (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text || !viewing || !socketRef.current) return;
    socketRef.current.emit('live:comment', { live_id: viewing.id, comment_text: text });
    setCommentText('');
  };

  const exitLive = async () => {
    if (viewing && socketRef.current) {
      socketRef.current.emit('live:leave', viewing.id);
    }
    if (viewing && !isCreator) {
      try { await leaveLive(viewing.id); } catch (_) {}
    }
    stopFrameRelay();
    if (isCreator) stopCamera();
    socketRef.current?.disconnect();
    socketRef.current = null;
    setViewing(null);
    loadLives();
  };

  const handleEndLive = async () => {
    if (socketRef.current) {
      socketRef.current.emit('live:ended', viewing.id);
    }
    try { await endLive(viewing.id); } catch (_) {}
    stopFrameRelay();
    stopCamera();
    socketRef.current?.disconnect();
    socketRef.current = null;
    setViewing(null);
    loadLives();
  };

  const handleStartLive = async () => {
    if (!title.trim()) return;
    setStarting(true);
    setError(null);
    try {
      const res = await startLive({
        title: title.trim(),
        stream_url: streamUrl.trim() || null,
        viewer_visibility: 'public',
      });
      setShowStart(false);
      setTitle('');
      setStreamUrl('');
      await loadLives();
      const created = res.data.data.live;
      if (created) {
        setViewing(created);
        setComments([]);
        setFrameSrc(null);
        setIsCreator(true);
        setViewerCount(created.viewer_count || 0);
        const token = localStorage.getItem('token');
        const socket = connectSocket(token);
        socketRef.current = socket;
        try {
          if (!socket.connected) {
            await new Promise((resolve) => socket.once('connect', resolve));
          }
          socket.emit('live:join', created.id);
        } catch (_) {}
        const onEnded = (data) => {
          if (data.live_id === created.id) {
            setViewing(null);
            loadLives();
          }
        };
        socket.on('live:ended', onEnded);
        socket.on('live:viewer_count', (data) => {
          if (data.live_id === created.id) {
            setViewerCount(data.viewer_count);
          }
        });
        await startCamera();
        if (localStreamRef.current && socketRef.current) {
          startFrameRelay();
        }
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to start live'));
    } finally {
      setStarting(false);
    }
  };

  if (viewing) {
    const showLocalCamera = isCreator && localStreamRef.current && cameraState === 'active';
    const showRelay = !isCreator && frameSrc;
    const showStream = viewing.stream_url && !showLocalCamera;
    const showWaiting = !showLocalCamera && !showRelay && !showStream;

    return (
      <div className="mx-auto max-w-4xl pb-12">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <UserAvatar src={viewing.profile_image_url} alt={viewing.creator_username} size="md" as="span" />
            <div>
              <p className="font-bold text-slate-900 text-sm">{viewing.full_name || viewing.creator_username}</p>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Radio size={12} className="text-red-500 animate-pulse" /> LIVE · @{viewing.username}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 px-3 py-1.5 rounded-xl bg-slate-100">
              <Eye size={15} /> {formatCount(viewerCount)}
            </span>
            {isCreator ? (
              <>
                <button
                  type="button"
                  onClick={toggleMic}
                  className="p-2.5 rounded-xl text-slate-500 hover:text-primary-600 bg-slate-100 hover:bg-primary-50 transition-colors"
                  aria-label={micMuted ? 'Unmute mic' : 'Mute mic'}
                >
                  {micMuted ? <MicOff size={17} /> : <Mic size={17} />}
                </button>
                <button
                  type="button"
                  onClick={toggleCamera}
                  className="p-2.5 rounded-xl text-slate-500 hover:text-primary-600 bg-slate-100 hover:bg-primary-50 transition-colors"
                  aria-label="Toggle camera"
                >
                  {cameraState === 'active' ? <Camera size={17} /> : <CameraOff size={17} />}
                </button>
                <button type="button" onClick={handleEndLive} className="btn-danger rounded-xl text-sm">
                  End live
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShowReport(true)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label="Report live"
                >
                  <Flag size={18} />
                </button>
                <button type="button" onClick={exitLive} className="btn-secondary rounded-xl text-sm">
                  Leave
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="relative rounded-2xl overflow-hidden aspect-video border border-slate-100 shadow-inner bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900">
            <div className="absolute inset-0 grid place-items-center opacity-[0.35] pointer-events-none" aria-hidden>
              <div className="h-64 w-64 rounded-full bg-primary-500/20 blur-3xl" />
            </div>

            {showLocalCamera && (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover -scale-x-100 rounded-2xl animate-fade-in"
              />
            )}

            {showRelay && (
              <div className="absolute inset-0">
                <img
                  src={frameSrc}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-50"
                />
                <img
                  src={frameSrc}
                  alt="Live stream"
                  className="absolute inset-2 md:inset-3 w-[calc(100%-1rem)] md:w-[calc(100%-1.5rem)] h-[calc(100%-1rem)] md:h-[calc(100%-1.5rem)] object-contain rounded-xl ring-1 ring-white/10 shadow-2xl animate-fade-in"
                />
              </div>
            )}

            {showStream && (
              <video src={viewing.stream_url} controls autoPlay playsInline className="absolute inset-0 w-full h-full object-contain rounded-2xl" />
            )}

            {showWaiting && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="relative">
                  <Radio size={56} className="text-red-500 animate-pulse" />
                  <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                </div>
                <p className="text-white/80 font-bold mt-4 text-sm">{viewing.title}</p>
                {isCreator ? (
                  <>
                    <p className="text-white/50 text-xs mt-1">
                      {cameraState === 'denied' ? 'Camera unavailable — permission was denied.' : 'Enabling your camera...'}
                    </p>
                    {cameraState === 'denied' && viewing.stream_url && (
                      <p className="text-white/50 text-xs mt-1">Using the provided stream URL instead.</p>
                    )}
                  </>
                ) : (
                  <p className="text-white/50 text-xs mt-1">Starting the stream...</p>
                )}
              </div>
            )}

            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 62%, rgba(0,0,0,0.35) 100%)' }} aria-hidden />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" aria-hidden />

            <span className="absolute top-3 left-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                <Radio size={12} className="animate-pulse" /> LIVE
              </span>
              {isCreator && cameraState === 'active' && (
                <span className="hidden sm:inline-flex items-center gap-1.5 bg-white/90 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-lg backdrop-blur-sm">
                  {micMuted ? <MicOff size={11} /> : <Camera size={11} />}
                  {micMuted ? 'MUTED' : 'CAMERA'}
                </span>
              )}
            </span>
            <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
              <Eye size={13} /> {formatCount(viewerCount)}
            </span>
            {isCreator && cameraState === 'active' && (
              <span className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-bold backdrop-blur-sm shadow-lg">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
                </span>
                Streaming your camera
              </span>
            )}
          </div>

          {/* Comments panel */}
          <div className="flex flex-col rounded-2xl border border-slate-100 bg-white overflow-hidden h-[420px] lg:h-auto max-h-[420px] lg:max-h-none">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">Live chat</span>
              <span className="text-xs text-slate-400">{comments.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin bg-slate-50/50">
              {comments.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-8">No comments yet. Say hello!</p>
              )}
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2.5">
                  <UserAvatar src={comment.profile_image_url} alt={comment.username} size="xs" as="span" />
                  <div className="min-w-0">
                    <p className="text-xs">
                      <span className="font-bold text-slate-800">@{comment.username}</span>{' '}
                      <span className="text-slate-600 break-words">{comment.comment_text}</span>
                    </p>
                  </div>
                </div>
              ))}
              <div ref={commentsEndRef} />
            </div>
            <form onSubmit={sendComment} className="p-3 border-t border-slate-100 flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                maxLength={500}
                className="input flex-1 text-sm py-2"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="p-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-40"
                aria-label="Send comment"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

        {showReport && (
          <div className="fixed inset-0 z-[90] bg-black/50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowReport(false)}>
            <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl animate-zoom-in" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Flag size={18} className="text-red-500" /> Report live
              </h3>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Tell us what's wrong (max 500 characters)"
                maxLength={500}
                className="input min-h-[100px] resize-y"
              />
              <div className="flex gap-2 mt-4">
                <button type="button" className="btn-secondary flex-1 rounded-xl" onClick={() => setShowReport(false)}>Cancel</button>
                <button
                  type="button"
                  className="btn-danger flex-1 rounded-xl"
                  disabled={!reportReason.trim()}
                  onClick={async () => {
                    try {
                      await reportLive(viewing.id, reportReason.trim());
                      setShowReport(false);
                      setReportReason('');
                      window.alert('Live reported.');
                    } catch (_) {
                      setError('Unable to submit report');
                    }
                  }}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="headline-font text-3xl font-extrabold text-primary-900 flex items-center gap-2.5">
            <Radio size={26} className="text-red-500" /> Live
          </h1>
          <p className="text-sm text-slate-400 mt-1">Go live with your camera and share with people in Rubavu</p>
        </div>
        <button type="button" onClick={() => setShowStart(true)} className="btn-primary rounded-full inline-flex items-center gap-2 text-sm">
          <Video size={16} /> Go live
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6 text-sm" role="alert">{error}</div>}

      {showStart && (
        <div className="fixed inset-0 z-[90] bg-black/50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowStart(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-zoom-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Radio size={20} className="text-red-500" /> Start a live
              </h3>
              <button type="button" className="p-1.5 text-slate-400 hover:text-slate-600" onClick={() => setShowStart(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                  className="input"
                  placeholder="What's this live about?"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Stream URL (optional)</label>
                <input
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  className="input"
                  placeholder="https://your-stream.example/live.m3u8"
                />
                <p className="text-xs text-slate-400 mt-1">Leave empty to use your camera. Your browser will ask for permission when you go live.</p>
              </div>
              <button
                type="button"
                disabled={!title.trim() || starting}
                onClick={handleStartLive}
                className="btn-primary w-full rounded-xl"
              >
                {starting ? 'Starting...' : 'Start live with camera'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <Loading label="Loading live sessions..." />
      ) : error && !lives.length ? (
        <ErrorState message={error} onRetry={loadLives} />
      ) : lives.length === 0 ? (
        <EmptyState
          icon={Radio}
          message="No one is live right now. Be the first to go live with your camera!"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lives.map((live) => (
            <button
              key={live.id}
              type="button"
              onClick={() => enterLive(live)}
              className="group text-left rounded-2xl overflow-hidden border border-slate-100 bg-white hover:shadow-xl hover:shadow-primary-900/5 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="relative aspect-video bg-slate-100 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-700 to-accent-600">
                  <div className="relative">
                    <Radio size={40} className="text-white/90 animate-pulse" />
                    <span className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
                  </div>
                </div>
                <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                  <Radio size={11} className="animate-pulse" /> LIVE
                </span>
                <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-black/60 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                  <Eye size={12} /> {formatCount(live.viewer_count)}
                </span>
              </div>
              <div className="p-4">
                <p className="font-bold text-slate-900 text-sm line-clamp-1">{live.title}</p>
                <div className="mt-2 flex items-center gap-2.5">
                  <UserAvatar src={live.profile_image_url} alt={live.username} size="xs" as="span" />
                  <span className="text-xs text-slate-500 truncate">@{live.username}</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">{formatCount(live.viewer_count)} watching now</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 text-center text-xs text-slate-400">
        <Link to="/" className="hover:text-primary-600 font-semibold transition-colors">Back to home</Link>
      </div>
    </div>
  );
}