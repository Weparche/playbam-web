import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
  children: ReactNode
}

type State = {
  error: Error | null
}

export default class RouteErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[RouteErrorBoundary]', error, info.componentStack)
  }

  private handleRetry = () => {
    this.setState({ error: null })
    window.location.reload()
  }

  render() {
    if (this.state.error) {
      return (
        <main className="pb-main pb-routeFallback" role="alert">
          <div className="pb-container">
            <p>Stranica se nije učitala.</p>
            <button type="button" className="ew-btn-primary" onClick={this.handleRetry}>
              Osvježi stranicu
            </button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
