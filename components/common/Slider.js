import PagerView from 'react-native-pager-view'
import { View, StyleSheet } from 'react-native'
import { useCallback } from 'react'
import colors from '../../assets/constants/colors'
const Slider = ({
  children,
  slideIndex,
  setSlideIndex,
  pagination,
  containerStyle,
  sliderStyle,
  slideNumber,
  paginationStyle,
}) => {


  const handlePageSelected = useCallback(e => {
    const index = e.nativeEvent.position
    setSlideIndex(index)
  }, [])


  return (
    <View style={[containerStyle]}>
      <PagerView
        onPageSelected={handlePageSelected}
        style={[s.slider, sliderStyle]}
        initialPage={0}>
        {children}
      </PagerView>
      {pagination && (
        <View style={[s.paginationContainer, paginationStyle]}>
          {(() => {
            let content = []
            for (let i = 0; i < slideNumber; i++) {
              content.push(
                <View
                  key={i}
                  style={[
                    s.dot,
                    i === slideIndex ? { backgroundColor: colors.NORMAL } : {},
                    i === slideNumber - 1 ? { marginRight: 0 } : {},
                  ]}></View>
              )
            }
            return content
          })()}
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  paginationContainer: {
    width: '100%',
    height: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  slider: {
    flex: 1,
    overflow: 'visible',
  },
  dot: {
    width: 40,
    height: 8,
    backgroundColor: colors.SEC_BG,
    borderRadius: 4,
    marginRight: 8,
  },
})

export default Slider
