import React, { useCallback, useEffect, useRef } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import {
  NextButton,
  PrevButton,
  usePrevNextButtons
} from './EmblaCarouselArrowButtons'
import { DotButton, useDotButton } from './EmblaCarouselDotButton'

const TWEEN_FACTOR_BASE = 0.28

interface EmblaCarouselProps {
  slides: Array<{
    key: string
    title: string
    sub: string
    img: string
  }>
  options?: any
  // Called when the centered slide changes (selection)
  onSlideSelect: (key: string, index: number) => void
  // Called when user clicks the slide to enter
  onSlideClick?: (key: string, index: number) => void
  selectedSpread: string | null
}

const EmblaCarousel: React.FC<EmblaCarouselProps> = ({ slides, options, onSlideSelect, onSlideClick, selectedSpread }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(options)
  const tweenFactor = useRef(0)
  const tweenNodes = useRef<HTMLElement[]>([])

  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi)

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick
  } = usePrevNextButtons(emblaApi)

  const setTweenNodes = useCallback((api: any) => {
    // ✅ 从 container 里拿所有 parallax 层（包含克隆）
    tweenNodes.current = Array.from(
      api.containerNode().querySelectorAll('.embla__parallax__layer')
    ) as HTMLElement[]
  }, [])

  const setTweenFactor = useCallback((emblaApi: any) => {
    tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length
  }, [])

  const tweenParallax = useCallback((api: any, eventName?: string) => {
    const engine = api.internalEngine()
    const progress = api.scrollProgress()
    const snaps = api.scrollSnapList()
    const isScroll = eventName === 'scroll'

    const gap = parseFloat(getComputedStyle(api.containerNode()).columnGap || '0')
    const slidesInView = api.slidesInView(true) // ✅ 包含克隆

    // helper: slideIndex -> snapIndex
    const slideToSnapIndex = (slideIndex: number) =>
      engine.slideRegistry.findIndex((arr: number[]) => arr.includes(slideIndex))

    // 逐张 slide（包含克隆）计算位移
    for (let slideIndex = 0; slideIndex < tweenNodes.current.length; slideIndex++) {
      if (isScroll && !slidesInView.includes(slideIndex)) continue

      const snapIndex = slideToSnapIndex(slideIndex)
      let diff = snaps[snapIndex] - progress

      // loop 接缝修正（当 slide 被搬到两端时）
      if (engine.options.loop) {
        engine.slideLooper.loopPoints.forEach((lp: any) => {
          if (lp.index === slideIndex && lp.target() !== 0) {
            diff = lp.target() < 0 ? snaps[snapIndex] - (1 + progress)
                                   : snaps[snapIndex] + (1 - progress)
          }
        })
      }

      const node = tweenNodes.current[slideIndex]
      if (!node) continue

      const w = node.getBoundingClientRect().width // 用当前节点的实际宽度（含克隆）
      const unit = w + gap
      const translate = diff * (-1 * tweenFactor.current) * unit
      
      // 给视差位移加一个小"保险丝"，避免极端情况下接缝修正把背景推得太多
      const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
      const maxShift = Math.max(8, (gap || 0) * 0.8)  // 背景最多左右位移 ~gap 的 80%
      const clampedTranslate = clamp(translate, -maxShift, maxShift)
      
      node.style.transform = `translateX(${clampedTranslate}px) scale(1.15)`
    }
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    setTweenNodes(emblaApi)
    setTweenFactor(emblaApi)
    tweenParallax(emblaApi)

    emblaApi
      .on('reInit', setTweenNodes)
      .on('reInit', setTweenFactor)
      .on('reInit', tweenParallax)
      .on('scroll', tweenParallax)
      .on('slideFocus', tweenParallax)
      .on('select', () => {
        const idx = emblaApi.selectedScrollSnap()
        const slide = slides[idx]
        if (slide) onSlideSelect(slide.key, idx)
      })

    // Emit initial selection
    const idx = emblaApi.selectedScrollSnap()
    const slide = slides[idx]
    if (slide) onSlideSelect(slide.key, idx)
  }, [emblaApi, tweenParallax, setTweenNodes, setTweenFactor])

  return (
    <div className="embla relative">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {slides.map((slide, index) => (
                            <div className="embla__slide" key={`${slide.key}-${index}`}>
              <div className="embla__slide__number relative">
                {/* 背景层：做视差 - 绝对定位撑满卡壳 */}
                <div className="embla__parallax__layer pointer-events-none z-0 rounded-lg overflow-hidden">
                  <Image
                    src={slide.img}
                    alt="牌阵背景"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width:768px) 65vw, 312px"
                    style={{ 
                      objectPosition: 'center center',
                      objectFit: 'cover'
                    }}
                  />
                </div>

                {/* 卡壳（不参与视差）+ 点击层 */}
                <button
                  onClick={() => (onSlideClick ? onSlideClick(slide.key, index) : onSlideSelect(slide.key, index))}
                  className={`absolute inset-0 z-10 rounded-lg transition-transform duration-200 hover:scale-105
                    ${selectedSpread === slide.key ? 'ring-2 ring-purple-500' : ''}`}
                  aria-label={`选择牌阵：${slide.title}`}
                />
              </div>


            </div>
          ))}
        </div>
      </div>




    </div>
  )
}

export default EmblaCarousel
