import { Link, useLocation } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/jelajah?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src={logo} alt="MandarinFlix" className="w-9 h-9" referrerPolicy="no-referrer" crossOrigin="anonymous" />
          <span className="text-gold-gradient font-display text-xl font-bold hidden sm:block">
            MandarinFlix
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {!searchOpen && (
            <>
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === "/"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Beranda
              </Link>
              <Link
                to="/jelajah"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === "/jelajah"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Jelajah
              </Link>
            </>
          )}

          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2 animate-fade-in">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari drama..."
                className="bg-secondary text-foreground text-sm rounded-lg px-3 py-2 w-48 sm:w-64 outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => { setSearchOpen(false); setQuery(""); }}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X size={20} />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="text-muted-foreground hover:text-foreground p-2 rounded-lg transition-colors"
            >
              <Search size={20} />
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
