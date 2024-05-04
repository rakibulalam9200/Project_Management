import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { timeConstrains } from '../../assets/constants/TimeConstrain'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import RadioEmptyIcon from '../../assets/svg/radio-empty-gray.svg'
import RadioFilledIcon from '../../assets/svg/radio-filled-gray.svg'

const CRadio = ({ selected, setSelected }) => {
  //console.log('selected..,', selected)
  const [allContrains, setAllContrains] = useState([])
  const checkIfSelected = (constrain) => {
    return selected.id == constrain.id
  }

  const toggleSelected = (constrain) => {
    setSelected(constrain)
  }
  useEffect(() => {
    setAllContrains(timeConstrains)
    return () => {}
  }, [allContrains])
  return (
    <View style={{ flex: 1, marginVertical: 8 }}>
      <Text style={[g.caption1, { color: colors.PRIM_CAPTION }]}>Time Constrain</Text>
      <View
        style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 8}}
      >
        {allContrains?.map((constrain, idx) => {
          return (
            <TouchableOpacity
              key={idx}
              style={[{ flexDirection: 'row', alignItems: 'center', flex: 1 }]}
              onPress={() => toggleSelected(constrain)}
            >
              {checkIfSelected(constrain) ? <RadioFilledIcon /> : <RadioEmptyIcon />}
              <Text style={[{ marginLeft: 8 }, g.body1]}>{constrain.label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

export default CRadio

const s = StyleSheet.create({
  modalOuterContainer: {
    flex: 1,
    // padding: 16,
  },
  modalInnerContainer: {
    //   paddingVertical: 16,
    //   paddingLeft: 16,
    //   borderBottomColor: colors.SEC_BG,
  },
  outerContainer: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: colors.CONTAINER_BG,
  },
})
