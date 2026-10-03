import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-6 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
        {/* Brand / Copyright */}
        <div className="flex items-center gap-2.5">
          <span className="bg-indigo-600 text-white w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm">
            T
          </span>
          <span className="font-semibold text-slate-800">TaskFlow</span>
          <span className="text-slate-400 text-xs ml-2">
            © {new Date().getFullYear()} All rights reserved.
          </span>
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-6 font-medium">
          <Link to="/home" className="hover:text-indigo-600 transition-colors">Home</Link>
          <Link to="/projects" className="hover:text-indigo-600 transition-colors">Projects</Link>
          <Link to="/workspaces" className="hover:text-indigo-600 transition-colors">Workspaces</Link>
          <Link to="/settings" className="hover:text-indigo-600 transition-colors">Settings</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;