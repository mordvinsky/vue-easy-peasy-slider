<template>
  <div :style="CSSVars" class="easy-peasy-slider">

    <div :style="CSSVars" class="img-wrapper" @transitionend="doSlideStep()">
      <img v-for="(slide, index) in preparedSlides"
           :key="slide.img + slide.text + index" :alt="slide.text"
           :src="slide.img"
           @load="setResolution"
      >
    </div>

    <transition name="collapse">

      <div class="overlay" v-if="canSlideNow">
        <span v-if="setup.indexer" class="ui-element indexer">&nbsp;{{ indexer }}/{{ slides.length }}&nbsp;</span>
        <div class="arrows">
          <div v-if="setup.navs" class="ui-element left-arrow" @click="doSlideStep('left')">&nbsp;&lt;&nbsp;</div>
          <div v-if="setup.navs" class="ui-element right-arrow" @click="doSlideStep('right')">&nbsp;&gt;&nbsp;</div>
        </div>
        <div class="overlay-bottom">
          <div class="caption">&nbsp;{{slides[indexer-1].text}}&nbsp;</div>
          <div v-if="setup.pags" class="ui-element pags">
            <div class="pag-btn" v-for="(slide, index) in slides" :style="index + 1 === indexer && 'opacity: 1'" :key="slide.img + index" @click="doSlideStep(index + 1)"></div>
          </div>
        </div>
      </div>

    </transition>
  </div>
</template>

<script>
import nextFrame from '@/utils/nextFrame';
import { TRANSITION_DURATION } from '@/const/const';

export default {
  name: 'easy-peasy-slider',
  props: {
    slides: Array,
    setup: Object,
  },
  data() {
    return {
      engine: {
        next() {console.log('no engine created');}
      },
      canSlideNow: false,
      preparedSlides: [
        this.slides[this.slides.length - 1],
        ...this.slides,
        this.slides[0],
      ],
      indexer: 1,
      CSSVars: {
        '--current': 1,
        '--width': '480px',
        '--height': '270px',
        '--transition': 'none'
      },
      timer: null,
    };
  },
  methods: {
    setResolution( e ) {
      if ( e.target.width + 'px' !== this.CSSVars['--width'] ) this.CSSVars['--width'] = e.target.width + 'px';
      if ( e.target.height + 'px' !== this.CSSVars['--height'] ) this.CSSVars['--height'] = e.target.height + 'px';
      if ( this.CSSVars['--transition'] === 'none' ) {
        requestAnimationFrame(() => this.CSSVars['--transition'] = `all ${TRANSITION_DURATION} ease`);
      }
    },
    doSlideStep( payload ) {
      if ( payload && !this.canSlideNow ) return;
      this.engine.next(payload);
    },
    sliderGenerator: async function* () {
      console.log('engine* initialized');
      let hint, target;
      while ( true ) {

        console.log('-->yield hint');
        hint = yield 1;
        console.log(`<--hint received: ${hint}`);
        switch ( hint ) {
          case 'left':
            target = this.CSSVars['--current'] - 1;
            break;
          case 'right':
            target = this.CSSVars['--current'] + 1;
            break;
          default:
            target = hint;
        }
        if ( this.isInvalid(target) ) continue;
        this.canSlideNow = false;
        this.CSSVars['--current'] = target

        console.log('--> yield transition end');
        yield;
        console.log('<-- transition ended');

        await this.handleSliderLoop();
        this.indexer = this.CSSVars['--current']
        this.canSlideNow = true;
      }
    },

    isInvalid( target ) {
      return (
          this.isCurrent(target)
          || this.isLoopDisallowedAndDirectingToOutOfReach(target)
      );
    },
    isCurrent( target ) {
      return target === this.CSSVars['--current'];
    },
    isLoopDisallowedAndDirectingToOutOfReach( target ) {
      return ( !this.setup.loop && this.isDirectingToOutOfReach(target) );
    },
    isDirectingToOutOfReach( target ) {
      return target === 0 || target === this.preparedSlides.length - 1;
    },
    handleSliderLoop: async function () {
      if ( !this.shouldSliderHandleLoop() ) return null;
      if ( this.isLastLeftSlideSelected() ) {
        this.CSSVars['--transition'] = 'none';
        await nextFrame;
        this.CSSVars['--current'] = this.preparedSlides.length - 2;
        await nextFrame;
        this.CSSVars['--transition'] = `all ${TRANSITION_DURATION} ease`;
      }
      if ( this.isLastRightSlideSelected() ) {
        this.CSSVars['--transition'] = 'none';
        await nextFrame;
        this.CSSVars['--current'] = 1;
        await nextFrame;
        this.CSSVars['--transition'] = `all ${TRANSITION_DURATION} ease`;
      }
    },
    shouldSliderHandleLoop() {
      return this.setup.loop && (this.isLastLeftSlideSelected() || this.isLastRightSlideSelected());
    },
    isLastLeftSlideSelected() {
      return this.CSSVars['--current'] === 0;
    },
    isLastRightSlideSelected() {
      return this.CSSVars['--current'] === this.preparedSlides.length - 1;
    },
    setupTimer() {
      if ( !this.setup.auto ) return;
      this.timer = setInterval(() => this.doSlideStep('right'), ( this.setup.delay ?? 3 ) * 1000);
    },
    clearTimer() {
      if ( !this.setup.auto ) return;
      clearInterval(this.timer);
    },
  },

  mounted() {
    this.engine = this.sliderGenerator();
    this.engine.next();
    this.setupTimer();
    this.canSlideNow = true;
  },
  beforeDestroy() {
    this.clearTimer();
  }

};
</script>

<style scoped>
.easy-peasy-slider {
  color: white;
  font-family: sans-serif;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-wrap: nowrap;
  overflow: hidden;
  width: var(--width);
  height: var(--height);
}

.img-wrapper {
  position: absolute;
  transform: translateX(calc(var(--current) * var(--width) * -1));
  transition: var(--transition);
  display: flex;
  flex-flow: row nowrap;
}

.overlay {
  position: absolute;
  display: grid;
  grid-template: 1fr 1fr 1fr / 1fr ;
  width: 100%;
  height: 100%;
}

.ui-element {
  font-size: 2rem;
}
.indexer {
  background-color: rgba(218, 0, 0, 0.77);
  place-self: flex-start;
  border-bottom-right-radius: 0.5rem;
}
.arrows {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
}
.left-arrow {
  height: auto;
  background-color: rgba(218, 0, 0, 0.77);
  cursor: pointer;
  border-bottom-right-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
}
.right-arrow {
  background-color: rgba(218, 0, 0, 0.77);
  cursor: pointer;
  border-bottom-left-radius: 0.5rem;
  border-top-left-radius: 0.5rem;
}
.overlay-bottom {
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-end;
  align-items: center;
}
.pags {
 display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.pag-btn {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background-color: #da0000;
  opacity: 0.8;
  border: 2px black;
  cursor: pointer;
}
.caption {
  background-color: rgba(218, 0, 0, 0.77);
  font-size: 2rem;
  margin: 0.5rem 0;
}

.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.2s ease;
}

.collapse-enter,
.collapse-leave-to {
  transform: scale(0.97);
  opacity: 0;
}
</style>