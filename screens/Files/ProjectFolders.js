import { useIsFocused } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import DraggableFlatList from 'react-native-draggable-flatlist'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import DownIcon from '../../assets/svg/arrow-down.svg'
import UpIcon from '../../assets/svg/arrow-up.svg'
import CheckedIcon from '../../assets/svg/cbchecked.svg'
import CheckedEmptyIcon from '../../assets/svg/cbempty.svg'
import CrossIcon from '../../assets/svg/cross.svg'
import TrashIcon from '../../assets/svg/delete_2.svg'
import FileIcon from '../../assets/svg/File.svg'
import GripIcon from '../../assets/svg/grip.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import SortIcon from '../../assets/svg/sort.svg'
import CSearchInput from '../../components/common/CSearchInput'
import CText from '../../components/common/CText'
import IconWrap from '../../components/common/IconWrap'

import { useSelector } from 'react-redux'
import { FILES_SORT_BY, SORT_BY } from '../../assets/constants/filesSortBy'
import MoreIcon from '../../assets/svg/more.svg'
import WarningIcon from '../../assets/svg/warning.svg'
import CButtonInput from '../../components/common/CButtonInput'
import CFloatingPlusIcon from '../../components/common/CFloatingPlusIcon'
import AttachmentOrFolderModal from '../../components/modals/AttachmentOrFolderModal'
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal'
import FilesFilterModal from '../../components/modals/FilesFilterModal'
import FilesSettingsModal from '../../components/modals/FilesSettingsModal'
import FilesSortModal from '../../components/modals/FilesSortModal'
import {
  formatArrayForPostData,
  getFileExtenstionFromUri,
  getMultipleAttachmentsFromDocuments,
} from '../../utils/Attachmets'
import { getErrorMessage } from '../../utils/Errors'

import moment from 'moment'
import CameraModal from '../../components/modals/CameraModal'
import ImagePreviewModal from '../../components/modals/ImagePreviewModal'
import PdfPreviewModal from '../../components/modals/PdfPreviewModal'
import { convertArrayToObjectForPost } from '../../utils/Array'
import HideKeyboard from '../../components/common/HideKeyboard'

export default function ProjectFolders({ navigation, route }) {
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showFiltersModal, setShowFiltersModal] = useState(false)
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [showCameraModal, setShowCameraModal] = useState(false)
  const [pdfDetails, setPdfDetails] = useState('')
  const [draggable, setDraggable] = useState(false)
  const [directories, setDirectories] = useState([])
  const [savedAttachments, setSavedAttachments] = useState([])
  const [message, setMessage] = useState('Any file that has been in Trash for 30 days will be permanently deleted.')
  const [refresh, setRefresh] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [attachments, setAttachments] = useState([])
  const [attachmentDeleteIndexes, setAttachmentDeleteIndexes] = useState([])
  const [documents, setDocuments] = useState([])
  const [openFile, setOpenFile] = useState(false)
  const isFocused = useIsFocused()

  const { showFileUploadModal } = useSelector((state) => state.tab)
  const [showSortModal, setShowSorteModal] = useState(false)
  const [sortBy, setSortBy] = useState(SORT_BY[0])
  const [selectable, setSelectable] = useState(false)
  const multipleSelect = useRef({})
  const [selectedAttachments, setSelectedAttachments] = useState([])
  const [selectedFolders, setSelectedFolders] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmationMessage, setDeleteConfirmationMessage] = useState('')
  const [selectedProject, setSelectedProject] = useState({ id: -1 })
  const [selectedMembers, setSelectedMembers] = useState([])
  const [selectedDateTime, setSelectedDateTime] = useState(null)
  const [selectedMilestone, setSelectedMilestone] = useState({ id: -1 })
  const [openAttachmentModal, setOpenAttachmentModal] = useState(
    route.params?.openAttachmentModal ? route.params?.openAttachmentModal : false
  )
  const [showOnlyFiles, setShowOnlyFiles] = useState(route.params?.onlyFiles ? route.params?.onlyFiles : false)

  const [showFiltersInParent, setShowFiltersInParent] = useState(false)
  const [expandFilters, setExpandFilters] = useState(true)
  const [showImagePreviewModal, setShowImagePreviewModal] = useState(false)
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null)

  let refetch = route.params ? route.params.refetch : null
  let uri = route?.params?.uri ? route?.params?.uri : null
  let id = route.params ? route.params.id : null
  let showTrash = route.params ? route.params.showTrash : null

  const rootId = useRef(0)
  const toggleRefresh = () => {
    setRefresh((prev) => !prev)
  }

  const onRefresh = () => {
    toggleRefresh()
  }

  // Directory component
  const DirectoryCard = ({ item, drag, isActive }) => {
    const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]

    const checkIfSelected = (folderId) => {
      const found = selectedFolders.find((folder) => folder == folderId)
      return found
    }
    const toggleSelected = (folderId) => {
      if (checkIfSelected(folderId)) {
        setSelectedFolders((prev) => {
          const copy = [...prev]
          return copy.filter((singleFolder) => folderId != singleFolder)
        })
      } else {
        setSelectedFolders((prev) => [...prev, folderId])
      }
    }
    if (!item?.url) {
      return (
        <View style={g.containerBetween}>
          {draggable && (
            <TouchableOpacity onPressIn={drag} style={s.containerGrip}>
              <GripIcon />
            </TouchableOpacity>
          )}
          <View style={[s.cardContainer, g.containerBetween]}>
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={s.cardRowBetween}
                onPress={() => {
                  if (!selectable) {

                    if (item?.action == 'Trash') {
                      navigation.push('ProjectFolders', { showTrash: true })
                    } else navigation.push('ProjectFolders', { id: item?.id })
                  } else {
                    if (item?.state == 'Custom') {
                      toggleSelected(item.id)
                    }
                  }
                }}
                onLongPress={() => {
                  if (item?.state == 'Custom') {
                    setSelectable((prev) => !prev)
                  }
                }}
              >
                <IconWrap onPress={() => { }} outputRange={iconWrapColors}>
                  {item?.action == 'Trash' ? <TrashIcon /> : <FileIcon />}
                </IconWrap>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={[s.cardTitle, { flex: 6 }]}>{item?.name}</Text>

                  <Text style={[s.cardTitle, { textAlign: 'right' }]}>
                    {item?.attachments_count}
                  </Text>

                  {selectable && item?.state == 'Custom' && item?.action != 'Trash' && (
                    <TouchableOpacity onPress={() => toggleSelected(item.id)}>
                      {checkIfSelected(item.id) ? <CheckedIcon /> : <CheckedEmptyIcon />}
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )
    } else if (item?.url) {
      return (
        <View style={{ marginTop: 10 }}>
          <FilesCard item={item} drag={drag} />
        </View>
      )
    }
  }

  // Files component
  const FilesCard = ({ item, drag }) => {
    const [showPdf, setShowPdf] = useState(false)
    const { name, url, created_at } = item
    const extension = getFileExtenstionFromUri(url).toLowerCase()
    const checkIfSelected = (fileId) => {
      const found = selectedAttachments.find((attachment) => attachment == fileId)
      return found
    }
    const toggleSelected = (fileId) => {
      if (checkIfSelected(fileId)) {
        setSelectedAttachments((prev) => {
          const copy = [...prev]
          return copy.filter((singlefile) => fileId != singlefile)
        })
      } else {
        setSelectedAttachments((prev) => [...prev, fileId])
      }
    }
    // const toggleDeleteMultiple = () => {
    //     multipleSelect.current[item?.id] = multipleSelect.current[item?.id] ? undefined : true
    // }
    return (
      <TouchableWithoutFeedback
        onLongPress={() => {
          setSelectable((prev) => !prev)
        }}
      >
        <View style={g.containerBetween}>
          <View style={{ flex: 1 }}>
            <View style={[s.contentContainer]}>
              <View style={[s.listContainer]}>
                <View>
                  {extension === '.jpg' || extension === '.jpeg' || extension === '.png' ? (
                    <TouchableOpacity
                      onPress={() => {
                        setImagePreviewUrl(url)
                        setShowImagePreviewModal(true)
                      }}
                      onLongPress={() => {
                        setSelectable((prev) => !prev)
                      }}
                    >
                      <Image style={s.image} source={{ uri: url }} />
                    </TouchableOpacity>
                  ) : (
                    <View style={[s.pdfContainer]}>
                      <Text style={{ fontWeight: '500' }}>{extension.slice(1).toUpperCase()}</Text>
                    </View>
                  )}
                </View>
                <View style={[s.itemTitle]}>
                  <TouchableOpacity
                    onPress={async () => {
                      if (extension === '.png' || extension === '.jpg' || extension === '.jpeg') {
                        setImagePreviewUrl(url)
                        setShowImagePreviewModal(true)
                      } else if (extension === '.pdf') {
                        setPdfDetails({ url, name })
                        setShowPdfModal(true)
                      }
                    }}
                    onLongPress={() => {
                      setSelectable((prev) => !prev)
                    }}
                  >
                    <Text style={{ marginBottom: 8, fontSize: 16, fontWeight: '500' }}>{name.slice(0, 20) + '...' + extension}</Text>
                  </TouchableOpacity>
                  <Text style={{ color: '#9CA2AB', fontWeight: '400' }}>{created_at}</Text>
                </View>
              </View>
              <View style={s.selectMargin}>
                {selectable && (
                  <TouchableOpacity onPress={() => toggleSelected(item.id)}>
                    {checkIfSelected(item.id) ? <CheckedIcon /> : <CheckedEmptyIcon />}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setQuery(search)
    }, 700)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  useEffect(() => {
    setLoading(true)
    let body = {}
    if (query != '') {
      body['search'] = query
    }

    if (showFiltersInParent) {
      body['filters'] = true
      if (selectedProject.id != -1) {
        body = { ...body, ...convertArrayToObjectForPost([selectedProject.id], 'project_ids') }
      }
      if (selectedMilestone.id != -1) {
        body = { ...body, ...convertArrayToObjectForPost([selectedMilestone.id], 'milestone_ids') }
      }
      if (selectedDateTime != null) {
        body['from_date'] = moment(selectedDateTime.firstDate).utc(true).format('YYYY-MM-DD')
        body['to_date'] = moment(selectedDateTime.secondDate).utc(true).format('YYYY-MM-DD')
      }
    }
    if (sortBy) {
      body['sort_by'] = sortBy.param
      body['order_by'] = sortBy.order_by
    }
    //console.log('body', body)

    if (showTrash) {
      api.fileManagement
        .getTrashItems(id, body, query)
        .then((res) => {
          let filesAndFolders = res?.data
          //console.log(filesAndFolders)
          let allDirectories = [...filesAndFolders?.files]
          setDirectories(allDirectories)
        })
        .catch((err) => {
          //console.log(err.response.data)
          let errorMsg = ''
          try {
            errorMsg = getErrorMessage(err)
          } catch (err) {
            errorMsg = 'An error occured. Please try again later.'
          }
          Alert.alert(errorMsg)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      api.fileManagement
        .getAttachments(id, body, query)
        .then((res) => {
          let filesAndFolders = res?.data
          rootId.current = res?.data?.id
          let allDirectories = []
          if (showOnlyFiles) {
            allDirectories = [...filesAndFolders?.attachments]
          } else {
            allDirectories = [...filesAndFolders?.folders, ...filesAndFolders?.attachments]
          }
          if (!id && !showTrash) {
            allDirectories.push({ name: 'Trash', action: 'Trash' })
          }
          setDirectories(allDirectories)
          //console.log(filesAndFolders?.folders)
        })
        .catch((err) => {
          //console.log(err.response.data)
          let errorMsg = ''
          try {
            errorMsg = getErrorMessage(err)
          } catch (err) {
            errorMsg = 'An error occured. Please try again later.'
          }
          Alert.alert(errorMsg)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [
    refresh,
    refetch,
    query,
    sortBy,
    route.params,
    showFiltersInParent,
    selectedProject,
    selectedMilestone,
    selectedDateTime,
    isFocused,
  ])

  const addOrUpdateAttachments = () => {
    setLoading(true)
    let attachments = getMultipleAttachmentsFromDocuments(documents)

    const body = {
      ...attachments,
    }

    api.fileManagement
      .addAttachmentsToFolder(id, body)
      .then((res) => {
        if (res.success) {
          toggleRefresh()
        }
      })
      .catch((err) => {
        //console.log(err, 'err file upload')
        let errorMsg = ''
        try {
          errorMsg = getErrorMessage(err)
        } catch (err) {
          errorMsg = 'An error occured. Please try again later.'
        }
        Alert.alert(errorMsg)
      })
      .finally(() => {
        setLoading(false)
        setOpenAttachmentModal(false)
        setDocuments([])
      })
  }

  const addAttachmentFromCamera = (uri) => {
    // let attachments = getAttachmentsFromDocuments(documents)
    const body = {
      'attachments[0]': {
        uri: uri,
        name: `image-${new Date().toLocaleTimeString()}.jpg`,
        type: 'image/jpeg',
      },
    }
    setLoading(true)
    api.fileManagement
      .addAttachmentsToFolder(id, body)
      .then((res) => {
        //console.log(res)
        if (res.success) {
          toggleRefresh()
        }
      })
      .catch((err) => {
        let errorMsg = ''
        try {
          errorMsg = getErrorMessage(err)
        } catch (err) {
          errorMsg = 'An error occured. Please try again later.'
        }
        Alert.alert(errorMsg)
      })
      .finally(() => {
        setLoading(false)
        setOpenAttachmentModal(false)
        setDocuments([])
      })
  }

  const saveFolder = (folderName) => {
    if (folderName != '') {
      let modelId = id ? id : rootId.current
      let body = {
        name: folderName,
        model_id: modelId,
      }
      //console.log(body)
      api.fileManagement
        .saveFolder(body)
        .then((res) => {
          if (res.success) toggleRefresh()
        })
        .catch((err) => {
          let errorMsg = ''
          try {
            errorMsg = getErrorMessage(err)
          } catch (err) {
            errorMsg = 'An error occured. Please try again later.'
          }
          Alert.alert(errorMsg)
        })
      setOpenAttachmentModal(false)
    } else {
      Alert.alert('Folder name cannot be empty.')
    }
  }

  const onDelete = () => {
    setShowSettingsModal(false)
    setDeleteConfirmationMessage('Do you want to delete these files? This will be stored in trash.')
    setShowDeleteModal(true)
  }

  const onFilter = () => {
    setShowSettingsModal(false)
    setShowFiltersModal(true)
  }

  const attemptDelete = () => {
    if (selectable && (selectedAttachments.length != 0 || selectedFolders.length != 0)) {
      let body = {}
      if (selectedAttachments.length > 0) {
        body = { ...formatArrayForPostData(selectedAttachments, 'deleteAttachmentIds') }
      }
      if (selectedFolders.length > 0) {
        body = { ...body, ...formatArrayForPostData(selectedFolders, 'model_ids') }
      }

      //console.log({ body })
      api.fileManagement
        .deleteMultipleAttachments(body)
        .then((res) => {
          if (res.success) {
            setShowDeleteModal(false)
            setSelectable(false)
            setRefresh((prev) => !prev)
          }
        })
        .catch((err) => {
          let errorMsg = ''
          try {
            errorMsg = getErrorMessage(err)
          } catch (err) {
            errorMsg = 'An error occured. Please try again later.'
          }
          Alert.alert(errorMsg)
        })
    } else {
      setShowDeleteModal(false)
      setSelectable(false)
      Alert.alert('Long press on any file and select at least one file to delete')
    }
  }

  const restoreFiles = (params) => {
    api.fileManagement
      .restoreTrashItems({ deleteAttachmentIds: params })
      .then((res) => {
        //console.log(res)
        setRefresh(!refresh)
        setSelectable(false)
        setSelectedAttachments([])
        Alert.alert('Restored Successfully')
      })
      .catch((err) => {
        //console.log(err.response.data)
        setRefresh(!refresh)
        setSelectedAttachments([])
        Alert.alert('Something Went Wrong')
      })
  }

  const attemptRestoreFiles = () => {
    if (selectable) {
      //console.log('REstoring', selectedAttachments)
      if (selectedAttachments.length > 0) {
        restoreFiles(selectedAttachments)
      } else {
        Alert.alert('Select At Least One')
      }
    }
  }

  const attemptPermanentDelete = () => {
    setDeleteConfirmationMessage('Do you want to delete these files permanently?')
    setShowDeleteModal(true)
  }

  const attemptPermanentlyDelete = () => {
    api.fileManagement
      .deleteFilesPermanently({ deleteAttachmentIds: selectedAttachments })
      .then((res) => {
        //console.log(res)
        setRefresh(!refresh)
        setSelectable(false)
        setSelectedAttachments([])
        setShowDeleteModal(false)
        Alert.alert('Permanently Deleted Files.')
      })
      .catch((err) => {
        //console.log(err.response.data)
        setRefresh(!refresh)
        setSelectedAttachments([])
        Alert.alert('Something Went Wrong')
      })
  }

  // Reset Filters

  const resetUsers = () => {
    setSelectedMembers([])
  }

  const resetProject = () => {
    setSelectedProject({ id: -1, name: '' })
  }

  const resetMilestone = () => {
    setSelectedMilestone({ id: -1, name: '' })
  }

  const resetDate = () => {
    setSelectedDateTime(null)
  }

  useEffect(() => {
    //console.log('Selected Date', selectedDateTime)
    if (
      selectedMembers.length == 0 &&
      selectedProject.id == -1 &&
      selectedMilestone.id == -1 &&
      selectedDateTime == null
    ) {
      setShowFiltersInParent(false)
      // setBody({})
    } else {
      setShowFiltersInParent(true)
    }
  }, [selectedMembers, selectedProject, selectedMilestone, selectedDateTime])


  const handleSelectAll = () => {
    if (selectable) {
      if (selectedAttachments.length == directories.length) {
        setSelectedAttachments([])
      } else {
        setSelectedAttachments(directories.map((item) => item.id))
      }
    }
  }

  return (
    <HideKeyboard>
      <SafeAreaView
        style={[
          { flex: 1, backgroundColor: colors.CONTAINER_BG },
          { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
        ]}
      >
        <StatusBar style="dark-content" backgroundColor={colors.CONTAINER_BG} />
        <View style={[s.outerContainer]}>
          <PdfPreviewModal
            visibility={showPdfModal}
            setVisibility={setShowPdfModal}
            details={pdfDetails}
          />
          <CameraModal
            visibility={showCameraModal}
            setVisibility={setShowCameraModal}
            onSave={(uri) => addAttachmentFromCamera(uri)}
          />
          <AttachmentOrFolderModal
            openModal={openAttachmentModal}
            setOpenModal={setOpenAttachmentModal}
            attachments={attachments}
            setAttachmentDeleteIndexes={setAttachmentDeleteIndexes}
            attachmentDeleteIndexes={attachmentDeleteIndexes}
            documents={documents}
            setDocuments={setDocuments}
            addOrUpdateAttachments={addOrUpdateAttachments}
            saveFolder={saveFolder}
            onCamera={() => setShowCameraModal(true)}
            loading={loading}
          />
          <ImagePreviewModal
            visibility={showImagePreviewModal}
            setVisibility={setShowImagePreviewModal}
            image={imagePreviewUrl}
            showDownload
          />
          <FilesSettingsModal
            visibility={showSettingsModal}
            setVisibility={setShowSettingsModal}
            onDelete={onDelete}
            onFilter={onFilter}
          />
          <FilesFilterModal
            visibility={showFiltersModal}
            setVisibility={setShowFiltersModal}
            setSelectedProject={setSelectedProject}
            setSelectedMembers={setSelectedMembers}
            setSelectedDateTime={setSelectedDateTime}
            setShowFiltersInParent={setShowFiltersInParent}
            milestone={selectedMilestone}
            setMilestone={setSelectedMilestone}
          />
          <FilesSortModal
            visibility={showSortModal}
            setVisibility={setShowSorteModal}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
          <DeleteConfirmationModal
            visibility={showDeleteModal}
            setVisibility={setShowDeleteModal}
            confirmationMessage={deleteConfirmationMessage}
            onDelete={showTrash ? attemptPermanentlyDelete : attemptDelete}
          />
          <View style={s.outerPadding}>
            <View style={s.headerContainer}>
              <TouchableOpacity
                onPress={() => {
                  navigation.goBack()
                }}
              >
                <BackArrow fill={colors.NORMAL} />
              </TouchableOpacity>
              <CText style={[g.title3, s.textColor]}>{showTrash ? 'Trash' : 'Files'}</CText>
              <View style={s.buttonGroup}>
                {!showTrash ? (
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        setShowSorteModal(true)
                      }}
                      style={s.buttonGroupBtn}
                    >
                      <SortIcon fill={colors.NORMAL} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setShowSettingsModal(true)
                      }}
                      style={s.buttonGroupBtn}
                    >
                      <MoreIcon fill={colors.NORMAL} />
                    </TouchableOpacity>
                  </>

                ) : <>
                  <TouchableOpacity
                    // onPress={() => {
                    //   setShowSorteModal(true)
                    // }}
                    style={s.buttonGroupBtn}
                  >
                    {/* <SortIcon fill={colors.NORMAL} /> */}
                  </TouchableOpacity>

                </>
                }
              </View>
            </View>

            {!showTrash && (
              <CSearchInput
                placeholder="Search"
                value={search}
                setValue={setSearch}
                filterIcon={true}
                onPress={() => setShowFiltersModal(true)}
              />
            )}

            {/* Filters view */}
            {showFiltersInParent && (
              <View style={{ marginTop: 20, paddingHorizontal: 16 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                  }}
                >
                  <Text style={s.filterText}>Filters</Text>
                  {!expandFilters ? (
                    <TouchableOpacity
                      onPress={() => {
                        setExpandFilters(true)
                      }}
                    >
                      <UpIcon />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => {
                        setExpandFilters(false)
                      }}
                    >
                      <DownIcon />
                    </TouchableOpacity>
                  )}
                </View>

                {!expandFilters && (
                  <View style={[s.filterBoxesContainer]}>
                    <View style={s.filterContainer}>
                      {selectedMembers.length > 0 &&
                        selectedMembers.map((user, id) => {
                          return (
                            <View style={[s.userItemContainer]} key={id}>
                              <Text style={s.userItemTextDark}>
                                {user?.name ? user?.name : user?.email.split('@')[0]}
                              </Text>
                            </View>
                          )
                        })}
                      {selectedMembers.length > 0 && (
                        <TouchableOpacity onPress={resetUsers}>
                          <CrossIcon />
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={s.filterContainer}>
                      {selectedProject.id !== -1 && (
                        <View style={[s.userItemContainer]}>
                          <Text style={s.userItemTextDark}>{selectedProject?.name}</Text>
                        </View>
                      )}
                      {selectedProject.id !== -1 && (
                        <TouchableOpacity onPress={resetProject}>
                          <CrossIcon />
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={s.filterContainer}>
                      {selectedMilestone.id !== -1 && (
                        <View style={[s.userItemContainer]}>
                          <Text style={s.userItemTextDark}>{selectedMilestone?.name}</Text>
                        </View>
                      )}
                      {selectedMilestone.id !== -1 && (
                        <TouchableOpacity onPress={resetMilestone}>
                          <CrossIcon />
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={s.filterContainer}>
                      {selectedDateTime != null && (
                        <View style={[s.userItemContainer]}>
                          <Text style={s.userItemTextDark}>
                            {moment(selectedDateTime.firstDate).format('YYYY.MM.DD')} -{' '}
                            {moment(selectedDateTime.secondDate).format('YYYY.MM.DD')}
                          </Text>
                        </View>
                      )}
                      {selectedDateTime != null && (
                        <TouchableOpacity onPress={resetDate}>
                          <CrossIcon />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              </View>
            )}
            {/* Filters view end */}
          </View>

          {!loading && showTrash && (
            <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center', marginVertical: 16, width: '100%' }}>
              <WarningIcon />
              <Text style={{ fontSize: 14, fontWeight: '400' }}>{message}</Text>
            </View>
          )}
          {!loading && directories.length == 0 && savedAttachments.length == 0 && (
            <Text>No item to show.</Text>
          )}

          {loading && <ActivityIndicator size="small" color={colors.NORMAL} />}

          {!loading && (
            <>
              {(selectable && showTrash) && (
                <View style={{ flexDirection: 'row', paddingRight: 10, width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectable(false)
                      multipleSelect.current = {}
                      setSelectedAttachments([])
                    }}
                    style={{}}
                  >
                    <BackArrow fill={colors.NORMAL} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSelectAll} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: '700' }}>Select all</Text>
                    {selectedAttachments.length == directories.length ? <CheckedIcon /> : <CheckedEmptyIcon />}
                    {/* <CheckedEmptyIcon /> */}
                  </TouchableOpacity>
                </View>
              )}

              {directories.length > 0 && (
                <DraggableFlatList
                  showsVerticalScrollIndicator={false}
                  data={directories}
                  onDragBegin={() => { }}
                  onDragEnd={({ data }) => {
                    setDirectories(data)
                  }}
                  keyExtractor={(item, idx) => idx}
                  renderItem={DirectoryCard}
                  containerStyle={{
                    flex: 1,
                    // borderWidth: 1,
                    // height: '40%',
                    flexDirection: 'row',
                    marginBottom: selectable && showTrash ? 0 : 80,

                  }}
                />
              )}
            </>
          )}

          {!route?.params?.showTrash && !selectable && (
            <CFloatingPlusIcon onPress={() => setOpenAttachmentModal(true)} />
          )}

          {selectable && route?.params?.showTrash && (
            <View style={s.bottomButtons}>
              <CButtonInput label="Restore" onPress={attemptRestoreFiles} />
              <CButtonInput
                label="Delete"
                onPress={attemptPermanentDelete}
                style={{ backgroundColor: 'red' }}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </HideKeyboard>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'stretch',
    paddingTop: 20,
    backgroundColor: 'yellow',
  },
  scrollContainer: {
    paddingBottom: 100,
    paddingHorizontal: 23,
    paddingTop: 4,
  },
  listContainer: {
    flexDirection: 'row',
    // marginBottom: 16,
    alignItems: 'center',
  },
  image: {
    height: 64,
    width: 64,
    borderRadius: 10,
  },
  pdfContainer: {
    height: 64,
    width: 64,
    borderRadius: 10,
    backgroundColor: '#D6E2FF',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
  },
  itemTitle: {
    marginLeft: 16,
  },
  outerContainer: {
    // paddingTop: StatusBar.currentHeight,
    backgroundColor: colors.PRIM_BG,
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16
  },
  outerPadding: {
    // paddingHorizontal: 16,
    width: '100%',
  },
  textColor: {
    color: 'black',
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 16,
    // marginTop: 24,
    // backgroundColor:'yellow'
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonGroupBtn: {
    marginLeft: 10,
  },
  searchSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    marginVertical: 20,
    borderRadius: 10,
    paddingRight: 10,
    paddingLeft: 10,
  },
  searchIcon: {
    padding: 20,
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
    color: '#424242',
  },
  containerGrip: {
    padding: 10,
  },
  cardListContainer: {
    flex: 1,
    backgroundColor: 'blue',
  },
  cardContainer: {
    flex: 1,
    // paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#D6E2FF',
  },
  cardRowLeft: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderRadius: 20,
    padding: 10,
  },
  cardRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    padding: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
    color: '#001D52',
  },
  cardStatus: {
    fontSize: 14,
    letterSpacing: 1.1,
    borderRadius: 40,
    backgroundColor: '#1DAF2B',
    color: 'white',
    padding: 2,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  cardLevel: {
    fontSize: 14,
    letterSpacing: 1.1,
    borderRadius: 40,
    backgroundColor: '#F2F6FF',
    color: '#E9203B',
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginLeft: 10,
  },
  cardProgressText: {
    marginLeft: 10,
  },
  buttonGroupBtn: {
    marginLeft: 10,
  },
  selectMargin: {
    marginRight: 10,
    marginTop: 10,
  },
  containerRight: {
    position: 'relative',
    // left: 42,
    flexDirection: 'row',
  },
  containerRightDrag: {
    position: 'relative',
    left: 2,
    flexDirection: 'row',
  },
  overLapIcon: {
    position: 'relative',
    left: -24,
  },
  overLapIcon3: {
    position: 'relative',
    left: -48,
  },
  overLapIcon2: {
    position: 'relative',
    left: -72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'dodgerblue',
  },
  project: {
    fontSize: 14,
    color: '#9CA2AB',
    marginRight: 5,
    fontWeight: '500',
  },
  projectTitle: {
    fontSize: 14,
    color: '#001D52',
    marginRight: 5,
    fontWeight: '500',
  },
  bottomButtons: {
    marginBottom: 70,
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },

  filterText: {
    color: colors.HOME_TEXT,
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterBoxesContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 10,
  },

  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  userItemTextDark: {
    color: colors.HOME_TEXT,
  },

  userItemContainer: {
    backgroundColor: colors.WHITE,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 4,
  },
  statusItemContainer: {
    // backgroundColor: colors.WHITE,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 4,
  },
  // filter view styles end
})
