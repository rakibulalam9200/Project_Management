import React from 'react';
import { FlatList } from 'react-native';

export default function VirtualizedView(props) {
    return (
        <FlatList
            showsVerticalScrollIndicator={false}
            data={[]}
            ListEmptyComponent={null}
            keyExtractor={() => "dummy"}
            renderItem={null}
            ListHeaderComponent={() => (
                <React.Fragment>{props.children}</React.Fragment>
            )}
            style={{ marginTop: 50 }}
        />
    );
}