import React, { memo, useCallback, useEffect, useState } from 'react'
import {
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import DownAngularBrace from '../../assets/svg/expand.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import RightAngularBrace from '../../assets/svg/right_arrow_2.svg'
import useDelayedSearch from '../../hooks/useDelayedSearch'
import CButtonInput from '../common/CButtonInput'
import CSearchInput from '../common/CSearchInput'
import CText from '../common/CText'


const Accordion = memo(({ item, selected, setSelected }) => {
  const [child, setChild] = useState([]);
  const [showChild, setShowChild] = useState(false);

  const checkIfSelected = (item) => {
    let itemIdentifier = `${item?.state}_${item.id}`
    let selectedIdentifier = `${selected?.state}_${selected?.id}`
    if (itemIdentifier === selectedIdentifier) {
      return true
    } else {
      return false
    }
  }

  const toggleSelect = (item) => {
    //console.log('item', item)
    if (checkIfSelected(item)) {
      setSelected({})
    } else {
      setSelected(item)
    }
  }

  const fetchChild = useCallback(async (id, state) => {
    try {
      let body = {
        except: ['Timelog','Note']
      }
      const res = await api.timelog.getChild(id, state,body);
      return res.data;
    } catch (err) {
      //console.log('err', err);
      return [];
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (showChild) {
        try {
          const res = await fetchChild(item.id, item.state);
          setChild(res);
        } catch (err) {
          //console.log('err', err);
        }
      }
    };

    fetchData();
  }, [showChild, fetchChild, item.id, item.state]);

  const handleShowAndHide = useCallback(() => {
    setShowChild((prevShowChild) => !prevShowChild);
  }, []);


  const getItemDisplayName = () => {
    if (item.name) {
      return item.name;
    } else if (item.state === 'Note') {
      return 'Note';
    } else {
      return '';
    }
  };

  const renderChildAccordion = useCallback((childItem) => {
    return <Accordion key={childItem.id} item={childItem} selected={selected} setSelected={setSelected} />;
  }, [selected, setSelected]);

  return (
    <View style={{}}>
      <View style={styles.accordionStyle}>
        <View style={[styles.accordionItem, checkIfSelected(item) && styles.accordionSelected]}>
          <TouchableOpacity onPress={handleShowAndHide}>
            {showChild ? <DownAngularBrace /> : <RightAngularBrace fill={colors.NORMAL} />}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => toggleSelect(item)}
          ><CText style={[styles.textColor]}>{getItemDisplayName()}</CText></TouchableOpacity>
        </View>
      </View>
      {showChild && (
        <View style={{ paddingLeft: 8, }}>
          <FlatList
            data={child}
            renderItem={({ item }) => renderChildAccordion(item)}
            showsVerticalScrollIndicator={false}
            style={{}}
          />
        </View>
      )}
    </View>
  );
});

const AddLogWorkPickerModal = ({
  visiblility,
  setVisiblility,
  selected,
  setSelected
}) => {

  const [selectedData, setSelectedData] = useState({})
  const [projects, setProjects] = useState([])
  const [childrens, setChildrens] = useState([])
  const { search, setSearch, delayedSearch } = useDelayedSearch()

  const closeModal = () => {
    setVisiblility(false)
  }


  useEffect(() => {
    const getAllProjects = async () => {
      const params = {
        allData: 1,
        withCount: ['childs']
      }
      api.project.getAllProjects(params)
        .then(res => {
          console.log('res projects with child', res)
          setProjects(res)
        })
        .catch(err => {
          //console.log('err', err)
        })
    }

    getAllProjects()

  }, [])


  const handleSelect = () => {
    setSelected(selectedData)
    closeModal()
  }

  return (
    <Modal visible={visiblility} animationType="fade" onRequestClose={closeModal}>
      <SafeAreaView
        style={[g.safeAreaStyleWithPrimBG, { marginTop: 0, paddingTop: 0 }]}
      >

        <View style={{ flex: 1, paddingHorizontal: 16, marginBottom: 20 }}>

          <View style={styles.headerContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity
                onPress={() => {
                  closeModal()
                }}
              >
                <BackArrow fill={colors.NORMAL} />
              </TouchableOpacity>
            </View>
            <CText style={[styles.textColor]}>Select</CText>
            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.buttonGroupBtn} />
            </View>
          </View>

          <CSearchInput placeholder="Search" searchIcon />

          <View style={{ flex: 1 }}>
            <FlatList
              data={projects}
              renderItem={(props) => (<Accordion {...props} selected={selectedData} setSelected={setSelectedData} />)}
              showsVerticalScrollIndicator={false}
              style={{}}
            />
          </View>

          <View style={[g.containerBetween, styles.resetContainer]}>
            <CButtonInput label="Select" onPress={handleSelect} style={{ width: '100%' }} />
          </View>
        </View>


      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({

  accordionStyle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },

  accordionItem: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%', paddingHorizontal: 8, paddingVertical: 4, },

  accordionSelected: { backgroundColor: colors.SEC_BG, borderRadius: 8 },

  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 24,
    // marginTop: 24,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonGroupBtn: {
    marginLeft: 10,
  },
  textColor: {
    color: 'black',
    fontSize: 16,
    lineHeight: 21,
    fontFamily: 'inter-medium',
    textAlignVertical: 'center',
    color: '#000E29',
  },
})

export default AddLogWorkPickerModal
