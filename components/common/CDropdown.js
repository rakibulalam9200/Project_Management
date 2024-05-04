import {
  View,
  StyleSheet,
  Pressable,
  TouchableHighlight,
  TouchableOpacity,
  Modal,
  ScrollView,
  StatusBar,
  Dimensions,
  Text,
} from 'react-native'
import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import CText from './CText'
import ArrowIcon from '../../assets/svg/arrow.svg'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

const windowHeight = Dimensions.get('window').height

const CDropdown = ({
  label,
  items,
  placeholderText,
  style,
  setValue,
  value,
  setPickedItem,
  scroll,
  loadData,
  paginate,
  fullLoaded,
  errorMessage,
}) => {
  const dropdown = useRef(null)
  const contentBox = useRef(null)
  const align = useRef('bottom')
  const [currentItem, setCurrentItem] = useState(
    value
      ? items.find((item) => item.id === value)
      : {
          content: placeholderText,
        }
  )
  const [visibility, setVisibility] = useState(false)
  const [modalStyle, setModalStyle] = useState({ top: -1000, left: -1000 })
  const [ddBorderRadius, setddBorderRadius] = useState({ borderRadius: 8 })
  const [arrowStyle, setArrowStyle] = useState({
    transform: [
      {
        rotate: '180deg',
      },
    ],
  })

  useEffect(() => {
    setCurrentItem(
      value
        ? items.find((item) => item.id === value)
        : {
            content: placeholderText,
          }
    )
  }, [value])
  useLayoutEffect(() => {
    if (visibility) {
      const dropdownHeight = 64

      dropdown.current.measure((x, y, w, h, px, py) => {
        if (py + dropdownHeight * 4 < windowHeight) {
          align.current = 'bottom'
          setModalStyle({
            top: py - StatusBar.currentHeight + dropdownHeight,
            left: px,
            width: w,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          })
          setddBorderRadius({ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 })
        } else {
          contentBox.current.measure((lx, ly, lw, lh, lpx, lpy) => {
            align.current = 'top'
            setModalStyle({
              top: py - StatusBar.currentHeight - lh,
              left: px,
              width: w,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
            })
          })
          setddBorderRadius({ borderTopLeftRadius: 0, borderTopRightRadius: 0 })
        }
      })

      setArrowStyle({
        transform: [
          {
            rotate: '0deg',
          },
        ],
      })
    } else {
      setddBorderRadius({})
      setArrowStyle({
        transform: [
          {
            rotate: '180deg',
          },
        ],
      })
    }
  }, [visibility])

  const toggleDropdown = () => {
    if (!scroll) {
      setVisibility((state) => !state)
    }
  }

  const setItem = (id) => {
    const item = items.find((item) => item.id === id)
    setCurrentItem(item)
    setPickedItem(item)
    toggleDropdown()
  }

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom
  }

  if (items && currentItem) {
    return (
      <View style={[s.container, style]}>
        {label ? <CText style={[g.caption1, s.label]}>{label}</CText> : null}
        <View>
          <Pressable onPress={toggleDropdown} style={[s.dropdown, ddBorderRadius]} ref={dropdown}>
            <CText style={[g.body1, { color: colors.PRIM_CAPTION }]}>{currentItem.content}</CText>
            <ArrowIcon style={[{ position: 'absolute', right: 15 }, arrowStyle]} fill="black" />
          </Pressable>
          <Modal
            transparent={true}
            visible={visibility}
            animationType="fade"
            onRequestClose={() => setVisibility(false)}
          >
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={1}
              onPressOut={() => setVisibility(false)}
            >
              <ScrollView
                onScroll={
                  loadData
                    ? ({ nativeEvent }) => {
                        if (!paginate && !fullLoaded && isCloseToBottom(nativeEvent)) {
                          loadData()
                        }
                      }
                    : null
                }
                scrollEventThrottle={400}
                bounces={false}
                ref={contentBox}
                style={[s.modal, modalStyle]}
                persistentScrollbar={true}
              >
                {items
                  .filter((item) => item.id !== currentItem.id)
                  .map((item, i) => {
                    const ddStyles = [s.ddItem]
                    if (
                      i === items.filter((item) => item.id !== currentItem.id).length - 1 &&
                      align.current === 'bottom'
                    ) {
                      ddStyles.push({ borderBottomWidth: 0 })
                    }

                    if (align.current === 'bottom' && i === 0) {
                      ddStyles.push({ borderTopWidth: 1 })
                    }
                    return (
                      <TouchableHighlight
                        activeOpacity={0.9}
                        underlayColor={colors.SEC_BG}
                        style={ddStyles}
                        key={item.id}
                        onPress={() => setItem(item.id)}
                      >
                        <CText style={[g.body1, { color: colors.PRIM_CAPTION }]}>
                          {item.content}
                        </CText>
                      </TouchableHighlight>
                    )
                  })}
              </ScrollView>
            </TouchableOpacity>
          </Modal>
        </View>
        <CText style={{ marginBottom: 0, color: '#E9203B' }}>{errorMessage ?? errorMessage}</CText>
      </View>
    )
  } else {
    return null
  }
}

const s = StyleSheet.create({
  container: { width: '100%' },
  modal: {
    position: 'absolute',
    maxHeight: 64 * 3,
    overflow: 'scroll',
    backgroundColor: colors.PRIM_BG,
  },
  dropdown: {
    display: 'flex',
    flexDirection: 'row',
    height: 64,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.INPUT_BG,
    borderRadius: 8,
    padding: 20,
    paddingRight: 55,
  },
  ddItem: {
    height: 64,
    backgroundColor: colors.PRIM_BG,
    display: 'flex',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 8,
    borderBottomWidth: 1,
    borderColor: colors.MID_BG,
  },
  label: {
    color: colors.PRIM_CAPTION,
    marginBottom: 4,
  },
})

export default CDropdown
