// Example in layout.tsx
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

function Header() {
  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />{" "}
            </svg>
          </div>
          <ul
            tabIndex={-1}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            <li>
              <a href="https://github.com/Kenkyoo">My Github</a>
            </li>
            <li>
              <a href="https://github.com/Kenkyoo/app-trpc-todo">Repo</a>
            </li>
            <li>
              <a href="https://app.netlify.com">Deploy</a>
            </li>
          </ul>
        </div>
        <a className="btn btn-ghost text-xl text-accent font-fantasy font-bold italic">GroceryApp</a>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <a href="https://github.com/Kenkyoo">My Github</a>
          </li>
          <li>
            <a href="https://github.com/Kenkyoo/app-trpc-todo">Repo</a>
          </li>
          <li>
            <a href="https://app.netlify.com">Deploy</a>
          </li>
        </ul>
      </div>
      <div className="navbar-end me-4">
        <SignedOut>
          <SignInButton>
          <button className="btn btn-primary text-white mx-2">Login</button>
        </SignInButton>
          <SignUpButton>
            <button className="btn btn-secondary text-white mx-2">Sign Up</button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
}

export default Header;
