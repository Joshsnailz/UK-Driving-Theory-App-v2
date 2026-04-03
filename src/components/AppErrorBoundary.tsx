import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Top-level error boundary. Catches render-time exceptions anywhere in the
 * tree and shows a recoverable fallback instead of a white screen.
 */
export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Intentionally minimal: crash reporting (Sentry/Crashlytics) can hook in
    // here later without changing the component contract.
    console.error('[AppErrorBoundary]', error, info.componentStack);
  }

  private reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>
          The app hit an unexpected error. Your progress is saved.
        </Text>
        {__DEV__ && <Text style={styles.detail}>{this.state.error.message}</Text>}
        <TouchableOpacity style={styles.button} onPress={this.reset} accessibilityRole="button">
          <Text style={styles.buttonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#F8FAFC' },
  title: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  message: { fontSize: 15, color: '#64748B', textAlign: 'center', marginBottom: 16 },
  detail: { fontSize: 12, color: '#DC2626', marginBottom: 16, textAlign: 'center' },
  button: { backgroundColor: '#1A56A0', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 24 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
