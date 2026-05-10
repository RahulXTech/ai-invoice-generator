import React, { useCallback, useEffect, useRef, useState } from 'react'
import {Link, useNavigate} from 'react-router-dom'
import { loginStyles, navbarStyles } from '../assets/dummyStyles'
import logo from '../assets/logo.png'
import {
  useUser,
  useClerk,
  useAuth,
  SignedOut
} from "@clerk/clerk-react";


function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  const {user} = useUser();
  const {getToken, isSignedIn} = useAuth();
  const clerk = useClerk();

  const navigate = useNavigate();
  const profileRef = useRef(null);
  const TOKEN_KEY = "token"

// for token generation (meaning fetch and store refresh for if not found). 
  const fetchAndStoreToken = useCallback(async ()=>{
    try{
      if(!getToken){
        return null;
      }
      const token = await getToken().catch(()=>null);
      if(token){
        try{
          localStorage.setItem(TOKEN_KEY, token);
          console.log(token);
        }
        catch(e){
          // ignore any errors
        }
        return token;
      }else{
        return null;
      }

    }
    catch(error){
      return null;
    }
  },[getToken]);

  // keep the localstorage token in sync with clerk auth state
useEffect(()=>{
  let mounted = true;

  (async()=>{
    if(isSignedIn){
      const t = await fetchAndStoreToken({template : "default"}).catch(
        ()=> null
      )
      if(!t && mounted){
        await fetchAndStoreToken({forceRefresh : true}).catch(()=>null)
      }
      else{
        try{
          localStorage.removeItem(TOKEN_KEY)
        }catch{}
      }
    }
  })();

return ()=>{
  mounted = false;
}
}, [isSignedIn,user, fetchAndStoreToken]);


// after successfull login redirect us to dashboard
useEffect(()=>{
  if(isSignedIn){
    const pathname = window.location.pathname || "/";
    if(
      pathname === '/login' ||
      pathname === '/signup' ||
      pathname.startsWith("/auth") ||
      pathname === '/'
    ){
      navigate("/app/dashboard", {replace : true});
    }
  }
})

// Close profile popover on outside click
useEffect(() => {
  function onDocClick(e) {
    if (!profileRef.current) return;
    if (!profileRef.current.contains(e.target)) {
      setProfileOpen(false);
    }
  }
  if (profileOpen) {
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("touchstart", onDocClick);
  }
  return () => {
    document.removeEventListener("mousedown", onDocClick);
    document.removeEventListener("touchstart", onDocClick);
  };
}, [profileOpen]);




//to open login modal
  function openSignIn(){
    try{
      if(clerk && typeof clerk.openSignIn === "function"){
        clerk.openSignIn();
      }else{
        navigate("/login");
      }
    }catch(err){
      console.error("openSigning failed :",err);
      navigate("/login")
    }
  }

  return (
    <header className={navbarStyles.header}>
      <div className={navbarStyles.container}>
        <nav className={navbarStyles.nav}>
            <div className={navbarStyles.logoSection}>
              <Link to='/' className={navbarStyles.logoLink}>
                <img src={logo} alt="logo" className={navbarStyles.logoImage}/>
                <span className={navbarStyles.logoText}>InvoiceAI</span>
              </Link>
              <div className={navbarStyles.desktopNav}>
                <a href="#pricing" className={navbarStyles.navLink}>
                  Features
                </a>
                <a href="#pricing" className={navbarStyles.navLinkInactive}>
                  Pricing
                </a>
              </div>
            </div>

          <div className="flex items-center gap-4">
            <div className={navbarStyles.authSection}>
              <SignedOut>
                <button onClick={openSignIn} className={navbarStyles.signInButton} type='button'>
                  Sign in
                </button>
              </SignedOut>
            </div>
          </div>

        </nav>
      </div>
    </header>
  )
}

export default Navbar