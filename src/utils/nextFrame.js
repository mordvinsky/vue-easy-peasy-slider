export default {
  then(resolve) {
    console.log('next frame batched')
    requestAnimationFrame(resolve);
  }
}