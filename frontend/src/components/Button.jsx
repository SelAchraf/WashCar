import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

export default function Button({ title, onPress, variant = 'primary', style, disabled = false }) {
  const containerStyles = [styles.base];
  if (variant === 'primary') containerStyles.push(styles.primary);
  if (variant === 'secondary') containerStyles.push(styles.secondary);
  if (variant === 'outline') containerStyles.push(styles.outline);
  if (disabled) containerStyles.push(styles.disabled);
  if (style) containerStyles.push(style);

  const textStyles = [styles.text];
  if (variant === 'outline') textStyles.push(styles.textDark);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        ...containerStyles,
        pressed ? { transform: [{ scale: 0.98 }], opacity: 0.9 } : null,
      ]}
    >
      <Text style={textStyles}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: '#1E40AF',
  },
  secondary: {
    backgroundColor: '#1f2937',
  },
  outline: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  disabled: { opacity: 0.5 },
  text: { color: '#ffffff', fontWeight: '600' },
  textDark: { color: '#111827' },
});


