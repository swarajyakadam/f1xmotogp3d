import { Component } from 'react'

/**
 * Post-processing is the most fragile thing in the scene — it compiles its own
 * shaders and is picky about drivers. Without its own boundary, one failure
 * takes the whole canvas down and the car disappears with it. The car matters
 * more than the bloom, so the bloom is what gets dropped.
 */
export default class SafeEffects extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(err) {
    console.warn('[stage] post-processing disabled, scene continues:', err?.message || err)
  }

  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}
