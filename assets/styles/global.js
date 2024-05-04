import { Platform, StatusBar, StyleSheet } from 'react-native'
import colors from '../constants/colors'

export default StyleSheet.create({
  h1: {
    fontSize: 30, //34,
    lineHeight: 34, //41,
    fontFamily: 'inter-bold',
    textAlignVertical: 'center',
  },
  h3: {
    fontSize: 18,
    fontFamily: 'inter-bold',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  menuText:{
    fontSize: 18,
    fontFamily: 'inter-medium',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  initailTitle: {
    fontSize: 24,
    lineHeight: 29,
    fontFamily: 'inter-semibold',
    textAlignVertical: 'center',
    color: 'white',
    textAlign: 'center',
  },
  initailText: {
    fontSize: 16,
    lineHeight: 19,
    fontFamily: 'inter-medium',
    textAlignVertical: 'center',
    color: 'white',
    textAlign: 'center',
  },
  titleText2: {
    fontSize: 24,
    lineHeight: 29,
    fontFamily: 'inter-semibold',
    textAlignVertical: 'center',
    textAlign: 'center',
  },

  titleTextTitle: {
    fontSize: 24,
    lineHeight: 29,
    fontFamily: 'inter-bold',
    textAlignVertical: 'center',
    textAlign: 'center',
  },

  title1: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: 'inter-bold',
    textAlignVertical: 'center',
  },
  title2: {
    fontSize: 22,
    lineHeight: 27,
    fontFamily: 'inter-semibold',
    textAlignVertical: 'center',
  },
  title3: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'inter-semibold',
    textAlignVertical: 'center',
  },
  button: {
    fontSize: 18,
    lineHeight: 22,
    fontFamily: 'inter-bold',
    textAlignVertical: 'center',
  },
  button2: {
    fontSize: 18,
    // lineHeight: 22,
    fontFamily: 'inter-medium',
    textAlignVertical: 'center',
    fontWeight: '700',
  },
  body1: {
    fontSize: 16,
    lineHeight: 21,
    fontFamily: 'inter-medium',
    textAlignVertical: 'center',
    color: '#000E29',
  },
  body2: {
    fontSize: 14,
    lineHeight: 17,
    fontFamily: 'inter-medium',
    textAlignVertical: 'center',
  },
  body3: {
    fontSize: 14,
    lineHeight: 17,
    fontFamily: 'inter-bold',
    textAlignVertical: 'center',
  },
  body4: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'inter-bold',
    textAlignVertical: 'center',
  },
  normalText2: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'inter-regular',
    textAlignVertical: 'center',
    color: '#001D52',
  },
  normalText: {
    fontSize: 16,
    lineHeight: 21,
    fontFamily: 'inter-regular',
    textAlignVertical: 'center',
    color: '#001D52',
  },
  gCardStatus: {
    fontSize: 14,
    letterSpacing: 1.1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.PRIM_BG,
    color: colors.WHITE,
    paddingVertical: 4,
    paddingHorizontal: 8,
    // marginLeft: 4,
  },
  safeAreaStyle: {
    flex: 1,
    backgroundColor: colors.CONTAINER_BG,
    paddingTop: Platform.OS == 'android' ? StatusBar.currentHeight : 0,
  },
  safeAreaStyleWithPrimBG: {
    flex: 1,
    backgroundColor: colors.PRIM_BG,
    paddingTop: Platform.OS == 'android' ? StatusBar.currentHeight : 0,
  },
  footnote: {
    fontSize: 13,
    lineHeight: 16,
    fontFamily: 'inter-medium',
    textAlignVertical: 'center',
  },
  caption1: {
    fontSize: 12,
    lineHeight: 15,
    fontFamily: 'inter-medium',
    textAlignVertical: 'center',
  },
  caption2: {
    fontSize: 11,
    lineHeight: 13,
    fontFamily: 'inter-medium',
    textAlignVertical: 'center',
  },
  callout: {
    fontSize: 16,
    lineHeight: 18,
    fontFamily: 'inter-regular',
    textAlignVertical: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  containerBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  containerLeft: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  containerRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  moreContainerRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginVertical: 8,
  },
  outerContainer: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: colors.CONTAINER_BG,
  },
  outerContainerPadding: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: colors.CONTAINER_BG,
    paddingTop: StatusBar.currentHeight,
  },
  modalOuterContainer: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: colors.CONTAINER_BG,
  },

  safeModalOuterContainer: {
    flex: 1,
    backgroundColor: colors.CONTAINER_BG,
    paddingTop: Platform.OS == 'android' ? StatusBar.currentHeight : 0,
  },

  listingOuterContainer: {
    flex: 1,
    backgroundColor: colors.CONTAINER_BG,
  },

  homeListingOuterContainer: {
    flex: 1,
    backgroundColor: colors.CONTAINER_BG,
  },

  innerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 56,
  },

  innerContentContainer: {
    paddingHorizontal: 16,
  },

  padding1x: {
    padding: 8,
  },
  padding2x: {
    padding: 16,
  },
  marginVertical1x: {
    marginVertical: 8,
  },
  marginVertical2x: {
    marginVertical: 16,
  },
  spaceBelow: {
    marginBottom: 82,
  },
  floatingPlus: {
    position: 'absolute',
    bottom: -15,
    right: 0,
  },
  hFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
    flex: 1,
  },
  listingSpaceBelow: {
    marginBottom: 55,
  },
  loaderConterainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  stackContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: colors.WHITE,
    marginVertical: 16,
  },
  stackButton: {
    width: '50%',
    borderRadius: 20,
    backgroundColor: colors.WHITE,
    paddingVertical: 8,
  },
  stackButtonActive: {
    backgroundColor: colors.ICON_BG,
  },
  stackButtonText: {
    color: colors.BLACK,
    fontSize: 16,
    textAlign: 'center',
  },
  stackButtonTextActive: {
    color: colors.WHITE,
    fontWeight: 'bold',
  },
  smallText1: {
    fontSize: 12,
    lineHeight: 15,
    fontFamily: 'inter',
    fontWeight: 'normal',
    // textAlignVertical: 'center',
  },
  filterButtonText: {
    color: colors.NORMAL,
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'inter-regular',
    fontWeight: '400',
  },
  filterButtonTextActive: {
    color: colors.WHITE,
    fontFamily: 'inter-bold',
    fontWeight: '700',
    fontSize: 18,
  },
  editorActivebuttonStyle: {
    backgroundColor: colors.CONTAINER_BG,
    borderBottomWidth: 1,
    border: 'gray',
    marginRight: 5,
  },
  contentCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
