import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field'

import colors from '../../assets/constants/colors'
const CELL_COUNT = 6
export default function CCodeInput({
  value,
  setValue,
  errorMessage,
  showErrorMessage = true,
  bgColor,
  textColor = null,
}) {
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT })
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  })

  return (
    <>
      <CodeField
        ref={ref}
        {...props}
        value={value}
        onChangeText={setValue}
        cellCount={CELL_COUNT}
        rootStyle={s.codeFieldRoot}
        keyboardType="default"
        textContentType="oneTimeCode"
        renderCell={({ index, symbol, isFocused }) => (
          <View
            key={index}
            style={[s.cell, isFocused && s.focusCell, bgColor]}
            onLayout={getCellOnLayoutHandler(index)}
          >
            <Text style={[s.cellText, textColor]}>{symbol || (isFocused ? <Cursor /> : null)}</Text>
          </View>
        )}
      />

      {showErrorMessage && <Text style={s.errorMessage}>{errorMessage}</Text>}
    </>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, padding: 20 },
  codeFieldRoot: { marginTop: 20 },
  cell: {
    width: '14%',
    height: 50,
    lineHeight: 38,
    fontSize: 24,
    borderWidth: 2,
    borderColor: colors.WHITE,
    borderRadius: 10,
    marginHorizontal: '1.5%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusCell: {},
  cellText: {
    color: colors.WHITE,
    fontSize: 24,
    fontWeight: 'bold',
  },
  errorMessage: {
    color: 'red',
    textAlign: 'left',
    width: '100%',
    marginBottom: 20,
    marginTop: 4,
  },
})
