import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Twitter } from 'lucide-react';
import logo from '../logo.png';

export default function Footer() {
    return (
        <footer className="brand-gradient mt-auto hidden text-white md:block">
            <div className="container-app grid gap-8 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
                <div>
                    <Link to="/" className="flex items-center gap-3">
                        <img src={logo} alt="Rubavu Connect logo" className="h-14 w-14 rounded-xl object-contain" />
                        <span className="text-xl font-extrabold">Rubavu Connect</span>
                    </Link>
                    <p className="mt-4 max-w-sm text-sm leading-6 text-blue-100">Connect with people, share posts, and keep in touch.</p>
                    <div className="mt-5 flex gap-2">
                        {[{ label: 'Facebook', icon: Facebook }, { label: 'Instagram', icon: Instagram }, { label: 'Twitter', icon: Twitter }, { label: 'Email', icon: Mail }].map(({ label, icon: Icon }) => <button key={label} type="button" aria-label={label} className="rounded-full bg-white/10 p-2.5 text-accent-200 transition hover:bg-accent-500 hover:text-white"><Icon size={17} /></button>)}
                    </div>
                </div>
                <div><h2 className="text-sm font-extrabold uppercase tracking-wider text-accent-200">Explore</h2><div className="mt-4 grid gap-3 text-sm text-blue-100"><Link to="/" className="hover:text-white">Home</Link><Link to="/discover" className="hover:text-white">Discover</Link><Link to="/connections" className="hover:text-white">Connections</Link><Link to="/messages" className="hover:text-white">Messages</Link></div></div>
                <div><h2 className="text-sm font-extrabold uppercase tracking-wider text-accent-200">Account</h2><div className="mt-4 grid gap-3 text-sm text-blue-100"><Link to="/settings/profile" className="hover:text-white">Edit profile</Link><Link to="/settings" className="hover:text-white">Settings</Link></div></div>
            </div>
            <div className="border-t border-white/15"><div className="container-app flex flex-wrap justify-between gap-3 py-4 text-xs text-blue-200"><span>© 2026 Rubavu Connect</span><span>People. Stories. Connection.</span></div></div>
        </footer>
    );
}
