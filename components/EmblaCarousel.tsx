"use client";

import React, { useCallback, useEffect, useRef } from "react";
import type {
  EmblaCarouselType,
  EmblaEventType,
  EmblaOptionsType,
} from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import {
  NextButton,
  PrevButton,
  usePrevNextButtons,
} from "./EmblaCarouselArrowButtons";
import { DotButton, useDotButton } from "./EmblaCarouselDotButton";
import { CardBody, CardContainer, CardItem } from "./ui/3d-card";
import Image from "next/image";
import Link from "next/link";

const TWEEN_FACTOR_BASE = 0.52;

const numberWithinRange = (number: number, min: number, max: number): number =>
  Math.min(Math.max(number, min), max);

export type EmblaCarouselProps = {
  slides: {
    title: string;
    image: string;
    link: string;
  }[];
  options?: EmblaOptionsType;
};

const EmblaCarousel: React.FC<EmblaCarouselProps> = ({ slides, options }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const tweenFactor = useRef(0);
  const tweenNodes = useRef<HTMLElement[]>([]);
  const prefersReducedMotion = useRef(false);

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  const setTweenNodes = useCallback((api: EmblaCarouselType) => {
    tweenNodes.current = api.slideNodes().map((slideNode) => {
      return slideNode.querySelector(".embla-slide-number") as HTMLElement;
    });
  }, []);

  const setTweenFactor = useCallback((api: EmblaCarouselType) => {
    tweenFactor.current = TWEEN_FACTOR_BASE * api.scrollSnapList().length;
  }, []);

  const tweenScale = useCallback(
    (api: EmblaCarouselType, eventName?: EmblaEventType) => {
      if (prefersReducedMotion.current) return;
      const engine = api.internalEngine();
      const scrollProgress = api.scrollProgress();
      const slidesInView = api.slidesInView();
      const isScrollEvent = eventName === "scroll";

      api.scrollSnapList().forEach((scrollSnap, snapIndex) => {
        let diffToTarget = scrollSnap - scrollProgress;
        const slidesInSnap = engine.slideRegistry[snapIndex];

        slidesInSnap.forEach((slideIndex) => {
          if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((loopItem) => {
              const target = loopItem.target();
              if (slideIndex === loopItem.index && target !== 0) {
                const sign = Math.sign(target);
                if (sign === -1)
                  diffToTarget = scrollSnap - (1 + scrollProgress);
                if (sign === 1)
                  diffToTarget = scrollSnap + (1 - scrollProgress);
              }
            });
          }

          const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current);
          const scale = numberWithinRange(tweenValue, 0, 1).toString();
          const tweenNode = tweenNodes.current[slideIndex];
          if (tweenNode) tweenNode.style.transform = `scale(${scale})`;
        });
      });
    },
    []
  );

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (typeof window !== "undefined") {
      prefersReducedMotion.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
    }

    if (!emblaApi) return;
    setTweenNodes(emblaApi);
    setTweenFactor(emblaApi);
    tweenScale(emblaApi);

    // Attach listeners only if animations are allowed
    if (!prefersReducedMotion.current) {
      emblaApi
        .on("reInit", setTweenNodes)
        .on("reInit", setTweenFactor)
        .on("reInit", tweenScale)
        .on("scroll", tweenScale)
        .on("slideFocus", tweenScale);
    } else {
      emblaApi.on("reInit", setTweenNodes).on("reInit", setTweenFactor);
    }
  }, [emblaApi, tweenScale, setTweenNodes, setTweenFactor]);

  return (
    <div
      className="w-full"
      role="region"
      aria-roledescription="carousel"
      aria-label="Services carousel"
    >
      <div className="overflow-hidden px-0" ref={emblaRef} aria-live="polite">
        <div className="flex mx-0 touch-pan-y touch-pinch-zoom">
          {slides.map((slide) => (
            <div
              key={slide.title}
              className="min-w-0 flex-[0_0_90%] md:flex-[0_0_55%] lg:flex-[0_0_40%]"
            >
              <Link href={slide.link} className="block h-full">
                <CardContainer className="inter-var h-full">
                  <CardBody className="embla-slide-number bg-card relative group/card border-border w-full h-full rounded-xl p-6 border">
                    <CardItem
                      translateZ="50"
                      className="text-xl font-bold text-primary"
                    >
                      {slide.title}
                    </CardItem>
                    <CardItem translateZ="100" className="w-full mt-4">
                      <Image
                        src={slide.image}
                        height="1000"
                        width="1000"
                        className="aspect-[16/9] border-border border shadow-sm object-cover rounded-xl group-hover/card:shadow-xl"
                        loading="lazy"
                        sizes="(min-width: 1024px) 40vw, (min-width: 768px) 55vw, 90vw"
                        alt="thumbnail"
                      />
                    </CardItem>
                  </CardBody>
                </CardContainer>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[auto_1fr] items-center gap-3">
        <div className="grid grid-cols-2 gap-2">
          <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
          <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
        </div>

        <div className="flex flex-wrap items-center justify-end -mr-1">
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              aria-selected={index === selectedIndex}
            >
              <span className="sr-only">Go to slide {index + 1}</span>
            </DotButton>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmblaCarousel;
