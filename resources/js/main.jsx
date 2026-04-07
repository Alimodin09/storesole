import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import '../scss/main.scss';

class AppErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ minHeight: '100vh', padding: '3rem 1.5rem', background: '#f3f7ff', color: '#10213a', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
                    <div style={{ maxWidth: '720px', margin: '0 auto', background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 10px 28px rgba(15, 38, 84, 0.08)', border: '1px solid #d8e4ff' }}>
                        <h1 style={{ marginTop: 0, color: '#0b5ed7' }}>SoleStore failed to load</h1>
                        <p style={{ marginBottom: '1rem' }}>A React error stopped the page from rendering. The app is mounted with an error boundary now so the issue is visible instead of showing a blank screen.</p>
                        <pre style={{ margin: 0, padding: '1rem', overflow: 'auto', background: '#f8fbff', borderRadius: '12px', border: '1px solid #d8e4ff', whiteSpace: 'pre-wrap' }}>
                            {this.state.error?.message || 'Unknown error'}
                        </pre>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const container = document.getElementById('app');
const root = window.__solestoreRoot ?? ReactDOM.createRoot(container);

window.__solestoreRoot = root;

root.render(
    <React.StrictMode>
        <AppErrorBoundary>
            <App />
        </AppErrorBoundary>
    </React.StrictMode>
);