import { SignInButton, UserButton } from "@clerk/nextjs";
import { SignIn, useUser } from '@clerk/nextjs'

export default function Home() {
  return (
    <div>
      {/* <UserButton 
        afterSignOutUrl="/"
      /> */}
      {/* <SignIn></SignIn> */}
      <SignInButton></SignInButton>

    </div>
  );
}
