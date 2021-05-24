<script>
import 'lazysizes';
import Vue from 'vue';
import VueResponsiveImage from '@/entry';

export default Vue.extend({
  name: 'ServeDev',
  components: {
    VueResponsiveImage,
  },
  data() {
    return {
      src: 'https://via.placeholder.com/200x100',
      srcset: [
        'https://via.placeholder.com/200x100 200w',
        'https://via.placeholder.com/400x200 400w',
      ].join(', '),
    };
  },
});
</script>

<template>
  <div id="app">
    <div>
      <h2>VueResponsiveImage:</h2>

      <p>Srcset (lazyload):</p>
      <p>
        <VueResponsiveImage
          :srcset="srcset"
          :lazyload="true"
          sizes="200px"
          width="200"
          height="100"
        />
      </p>

      <p>Srcset (lazyload, fallback):</p>
      <p>
        <VueResponsiveImage
          :srcset="srcset"
          :fallback="true"
          :lazyload="true"
          sizes="200px"
          width="200"
          height="100"
        />
      </p>

      <p>Srcset (lazyload, fallback, data-sizes="auto"):</p>
      <!-- throws error -->
      <p>
        <VueResponsiveImage
          :srcset="srcset"
          :fallback="true"
          :lazyload="true"
          sizes="auto"
          width="200"
          height="100"
        />
      </p>

      <p>Srcset:</p>
      <p>
        <VueResponsiveImage
          :srcset="srcset"
          sizes="200px"
          width="200"
          height="100"
        />
      </p>

      <p>Source only (lazy):</p>
      <p>
        <VueResponsiveImage
          :src="src"
          loading="lazy"
          width="200"
          height="100"
        />
      </p>

      <p>Source only:</p>
      <p>
        <VueResponsiveImage :src="src" width="200" height="100" />
      </p>
    </div>
  </div>
</template>

<style>
img.lazyloaded {
  border: 2px solid blue;
}
</style>
