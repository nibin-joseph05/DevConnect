import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  error?: string;
  disabled?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  containerStyle?: ViewStyle;
  required?: boolean;
}

/**
 * Custom input component with validation, icons, and consistent styling
 * Supports various input types and states
 */
const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  error,
  disabled = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  containerStyle,
  required = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRightIconPress = () => {
    if (secureTextEntry) {
      setShowPassword(!showPassword);
    } else if (onRightIconPress) {
      onRightIconPress();
    }
  };

  const getInputStyle = () => {
    const baseStyle = [styles.input, inputStyle];
    
    if (error) {
      baseStyle.push(styles.errorInput);
    } else if (isFocused) {
      baseStyle.push(styles.focusedInput);
    }
    
    if (disabled) {
      baseStyle.push(styles.disabledInput);
    }
    
    if (leftIcon) {
      baseStyle.push(styles.inputWithLeftIcon);
    }
    
    if (rightIcon || secureTextEntry) {
      baseStyle.push(styles.inputWithRightIcon);
    }
    
    return baseStyle;
  };

  const getContainerStyle = () => {
    const baseStyle = [styles.container, containerStyle];
    
    if (error) {
      baseStyle.push(styles.errorContainer);
    }
    
    return baseStyle;
  };

  return (
    <View style={getContainerStyle()}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <View style={[styles.inputContainer, style]}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <Ionicons name={leftIcon as any} size={20} color="#6C757D" />
          </View>
        )}
        
        <TextInput
          style={getInputStyle()}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#6C757D"
        />
        
        {(rightIcon || secureTextEntry) && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={handleRightIconPress}
            disabled={!onRightIconPress && !secureTextEntry}
          >
            <Ionicons
              name={
                secureTextEntry
                  ? (showPassword ? 'eye-off' : 'eye')
                  : (rightIcon as any)
              }
              size={20}
              color="#6C757D"
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  errorContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 8,
  },
  required: {
    color: '#DC3545',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#212529',
    minHeight: 44,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  focusedInput: {
    borderColor: '#007AFF',
  },
  errorInput: {
    borderColor: '#DC3545',
  },
  disabledInput: {
    backgroundColor: '#F8F9FA',
    color: '#6C757D',
  },
  leftIconContainer: {
    paddingLeft: 12,
    paddingRight: 8,
  },
  rightIconContainer: {
    paddingRight: 12,
    paddingLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#DC3545',
    marginTop: 4,
  },
});

export default Input;