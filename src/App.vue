<template>
  <easy-peasy-slider :slides="slides" :setup="sliderSetup"/>
</template>

<script>
import { slides } from '../public/slides';

import EasyPeasySlider from '@/components/easy-peasy-slider';
export default {
  name: 'App',
  components: {EasyPeasySlider},
  data() {
    return {
      slides,
      sliderSetup: {
        loop: false,
        navs: true,
        pags: true,
        auto: false,
        indexer: true,
        stopMouseHover: true,
        captions: true,
        delay: 3,
      }
    }
  }
}
</script>

<style>

</style>
