import React from 'react';
import { View } from 'react-native';
import RenderHTML from 'react-native-render-html';

const DescriptionComponent = ({description}) => {
    const source = {
        html: `${description}`,
      }
    return (
        <View style={{ marginBottom: 8}}>
            <RenderHTML source={source} />
        </View>
    );
};

export default DescriptionComponent;