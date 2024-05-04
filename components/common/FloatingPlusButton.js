import React from 'react';

const FloatingPlusButton = ({destination,navigation}) => {
    return (
        <TouchableOpacity style={s.plusButton} onPress={() => navigation.navigation(destination)}>
            <FloatingPlusButton />
          </TouchableOpacity>
    );
};

export default FloatingPlusButton;

const s = StyleSheet.create({
    plusButton: {
      position: 'absolute',
      bottom: -15,
      right: 0,
    },
  })