import React from "react";
import { OrbitingCircles } from "./ui/orbiting-circles";
import { Button } from "./ui/stateful-button";

const CountryOrbit = () => {
  return (
    <div className="py-20 w-full bg-black relative overflow-hidden flex items-center justify-center">
      {/* Crimson Spotlight Background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `
        radial-gradient(
          circle at center,
          rgba(239, 68, 68, 0.12) 0%,
          rgba(239, 68, 68, 0.09) 20%,
          rgba(0, 0, 0, 0.0) 60%
        )
      `,
        }}
      />
      <div className="max-w-7xl mx-auto px-3">
        <h2 className="text-4xl md:text-6xl text-balance text-center md:leading-20 max-w-3xl font-bold text-accent">
          Choose Your Country For Immigration.
        </h2>
        <div className="dark relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden">
          <OrbitingCircles iconSize={40}>
            <Icons.canada />
            <Icons.australia />
            <Icons.uk />
            <Icons.us />
            <Icons.germany />
          </OrbitingCircles>
          <OrbitingCircles iconSize={30} radius={100} reverse speed={2}>
            <Icons.denmark />
            <Icons.sweden />
            <Icons.poland />
            <Icons.switzerland />
          </OrbitingCircles>
        </div>

        <div className="flex items-center justify-center">
          <Button className="mt-6 bg-primary hover:ring-2 hover:ring-primary font-bold tracking-wide px-6 py-3 text-lg">
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

const Icons = {
  canada: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      id="flag-icons-ca"
      viewBox="0 0 512 512"
    >
      <path fill="#fff" d="M81.1 0h362.3v512H81.1z" />
      <path
        fill="#d52b1e"
        d="M-100 0H81.1v512H-100zm543.4 0h181.1v512H443.4zM135.3 247.4l-14 4.8 65.4 57.5c5 14.8-1.7 19.1-6 26.9l71-9-1.8 71.5 14.8-.5-3.3-70.9 71.2 8.4c-4.4-9.3-8.3-14.2-4.3-29l65.4-54.5-11.4-4.1c-9.4-7.3 4-34.8 6-52.2 0 0-38.1 13.1-40.6 6.2l-9.9-18.5-34.6 38c-3.8 1-5.4-.6-6.3-3.8l16-79.7-25.4 14.3q-3.3 1.3-5.6-2.4l-24.5-49-25.2 50.9q-3 2.7-5.4.8l-24.2-13.6 14.5 79.2c-1.1 3-3.9 4-7.1 2.3l-33.3-37.8c-4.3 7-7.3 18.4-13 21-5.7 2.3-25-4.9-37.9-7.7 4.4 15.9 18.2 42.3 9.5 51z"
      />
    </svg>
  ),
  australia: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      id="flag-icons-au"
      viewBox="0 0 512 512"
    >
      <path fill="#00008B" d="M0 0h512v512H0z" />
      <path
        fill="#fff"
        d="M256 0v32l-95 96 95 93.5V256h-33.5L127 162l-93 94H0v-34l93-93.5L0 37V0h31l96 94 93-94z"
      />
      <path
        fill="red"
        d="m92 162 5.5 17L21 256H0v-1.5zm62-6 27 4 75 73.5V256zM256 0l-96 98-2-22 75-76zM0 .5 96.5 95 67 91 0 24.5z"
      />
      <path fill="#fff" d="M88 0v256h80V0zM0 88v80h256V88z" />
      <path fill="red" d="M0 104v48h256v-48zM104 0v256h48V0z" />
      <path
        fill="#fff"
        d="m202 402.8-45.8 5.4 4.6 45.9-32.8-32.4-33 32.2 4.9-45.9-45.8-5.8L93 377.4 69 338l43.6 15 15.8-43.4 15.5 43.5 43.7-14.7-24.3 39.2 38.8 25.1Zm222.7 8-20.5 2.6 2.2 20.5-14.8-14.4-14.7 14.5 2-20.5-20.5-2.4 17.3-11.2-10.9-17.5 19.6 6.5 6.9-19.5 7.1 19.4 19.5-6.7-10.7 17.6zM415 293.6l2.7-13-9.8-9 13.2-1.5 5.5-12.1 5.5 12.1 13.2 1.5-9.8 9 2.7 13-11.6-6.6zm-84.1-60-20.3 2.2 1.8 20.3-14.4-14.5-14.8 14.1 2.4-20.3-20.2-2.7 17.3-10.8-10.5-17.5 19.3 6.8 7.2-19.1 6.7 19.3 19.4-6.3-10.9 17.3zm175.8-32.8-20.9 2.7 2.3 20.9-15.1-14.7-15 14.8 2.1-21-20.9-2.4 17.7-11.5-11.1-17.9 20 6.7 7-19.8 7.2 19.8 19.9-6.9-11 18zm-82.1-83.5-20.7 2.3 1.9 20.8-14.7-14.8L376 140l2.4-20.7-20.7-2.8 17.7-11-10.7-17.9 19.7 6.9 7.3-19.5 6.8 19.7 19.8-6.5-11.1 17.6z"
      />
    </svg>
  ),
  uk: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      id="flag-icons-gb"
      viewBox="0 0 512 512"
    >
      <path fill="#012169" d="M0 0h512v512H0z" />
      <path
        fill="#FFF"
        d="M512 0v64L322 256l190 187v69h-67L254 324 68 512H0v-68l186-187L0 74V0h62l192 188L440 0z"
      />
      <path
        fill="#C8102E"
        d="m184 324 11 34L42 512H0v-3zm124-12 54 8 150 147v45zM512 0 320 196l-4-44L466 0zM0 1l193 189-59-8L0 49z"
      />
      <path fill="#FFF" d="M176 0v512h160V0zM0 176v160h512V176z" />
      <path fill="#C8102E" d="M0 208v96h512v-96zM208 0v512h96V0z" />
    </svg>
  ),
  us: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      id="flag-icons-us"
      viewBox="0 0 512 512"
    >
      <path fill="#bd3d44" d="M0 0h512v512H0" />
      <path
        stroke="#fff"
        strokeWidth="40"
        d="M0 58h512M0 137h512M0 216h512M0 295h512M0 374h512M0 453h512"
      />
      <path fill="#192f5d" d="M0 0h390v275H0z" />
      <marker id="us-a" markerHeight="30" markerWidth="30">
        <path fill="#fff" d="m15 0 9.3 28.6L0 11h30L5.7 28.6" />
      </marker>
      <path
        fill="none"
        markerMid="url(#us-a)"
        d="m0 0 18 11h65 65 65 65 66L51 39h65 65 65 65L18 66h65 65 65 65 66L51 94h65 65 65 65L18 121h65 65 65 65 66L51 149h65 65 65 65L18 177h65 65 65 65 66L51 205h65 65 65 65L18 232h65 65 65 65 66z"
      />
    </svg>
  ),
  germany: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      id="flag-icons-de"
      viewBox="0 0 512 512"
    >
      <path fill="#fc0" d="M0 341.3h512V512H0z" />
      <path fill="#000001" d="M0 0h512v170.7H0z" />
      <path fill="red" d="M0 170.7h512v170.6H0z" />
    </svg>
  ),
  denmark: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      id="flag-icons-dk"
      viewBox="0 0 512 512"
    >
      <path fill="#c8102e" d="M0 0h512.1v512H0z" />
      <path fill="#fff" d="M144 0h73.1v512H144z" />
      <path fill="#fff" d="M0 219.4h512.1v73.2H0z" />
    </svg>
  ),
  sweden: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      id="flag-icons-se"
      viewBox="0 0 512 512"
    >
      <path fill="#005293" d="M0 0h512v512H0z" />
      <path
        fill="#fecb00"
        d="M134 0v204.8H0v102.4h134V512h102.4V307.2H512V204.8H236.4V0z"
      />
    </svg>
  ),
  poland: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      id="flag-icons-pl"
      viewBox="0 0 512 512"
    >
      <g fillRule="evenodd">
        <path fill="#fff" d="M512 512H0V0h512z" />
        <path fill="#dc143c" d="M512 512H0V256h512z" />
      </g>
    </svg>
  ),
  switzerland: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      id="flag-icons-ch"
      viewBox="0 0 512 512"
    >
      <g fillRule="evenodd" strokeWidth="1pt">
        <path fill="red" d="M0 0h512v512H0z" />
        <g fill="#fff">
          <path d="M96 208h320v96H96z" />
          <path d="M208 96h96v320h-96z" />
        </g>
      </g>
    </svg>
  ),
};

export default CountryOrbit;
