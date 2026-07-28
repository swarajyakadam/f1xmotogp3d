import { Component } from 'react'

/**
 * A dead GPU should cost you the car, not the whole site. Anything the WebGL
 * subtree throws is caught here and the DOM portfolio carries on alone.
 */
export default class StageBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(err) {
    console.warn('[stage] WebGL layer disabled:', err?.message || err)
    this.props.onFail?.()
  }

  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}
