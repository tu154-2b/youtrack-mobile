/* @flow */
import {View, ListView, Text, TouchableOpacity, StyleSheet} from 'react-native';
import ListViewDataSource from 'react-native/Libraries/CustomComponents/ListView/ListViewDataSource';
import React from 'react';
import {UNIT, COLOR_FONT_ON_BLACK, COLOR_GRAY} from '../variables/variables';
import type {TransformedSuggestion, SavedQuery} from '../../flow/Issue';

const SAVED_SEARCHES = 'SAVED_SEARCHES';
const LAST_SEARCHES = 'LAST_SEARCHES';
const SECTION_SPACING = 24;

const ds = new ListView.DataSource({
  rowHasChanged: (r1, r2) => r1 !== r2,
  sectionHeaderHasChanged: (s1, s2) => s1 !== s2
});

type State = {
  dataSource: ListViewDataSource
};

type Props = {
  style?: any,
  suggestions: Array<TransformedSuggestion | SavedQuery>,
  onApplySuggestion: (suggestion: TransformedSuggestion) => any,
  onApplySavedQuery: (savedQuery: SavedQuery) => any
};

export default class QueryAssistSuggestionsList extends React.Component {
  props: Props;
  state: State;
  isUnmounted: boolean;
  state = {
    dataSource: ds.cloneWithRows([])
  };

  constructor(props: Props) {
    super(props);
  }

  componentWillReceiveProps(newProps: Props) {
    this._prepareDataSource(newProps.suggestions);
  }

  _prepareDataSource(suggestions) {
    const isSavedSearches = suggestions.some(s => s.name);

    if (isSavedSearches) {
      this.setState({dataSource: ds.cloneWithRowsAndSections(this._prepareSectionedMap(suggestions))});
    } else {
      this.setState({dataSource: ds.cloneWithRows(suggestions)});
    }
  }

  _prepareSectionedMap = (suggestions: Array<TransformedSuggestion>) => {
    return {
      [SAVED_SEARCHES]: suggestions.filter(s => s.id),
      [LAST_SEARCHES]: suggestions.filter(s => !s.id)
    };
  }

  _renderRow = (suggestion: TransformedSuggestion | SavedQuery) => {
    if (suggestion.caret) {
      // marker that this is TransformedSuggestion
      return (
        <TouchableOpacity
          style={styles.searchRow}
          onPress={() => this.props.onApplySuggestion(suggestion)}
        >
          <Text style={styles.searchText}>{suggestion.option}</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          style={styles.searchRow}
          onPress={() => this.props.onApplySavedQuery(suggestion)}
        >
          <Text style={styles.searchText}>{suggestion.name}</Text>
        </TouchableOpacity>
      );
    }
  }

  _renderSectionHeader = (sectionData: Array<Object>, category: string) => {
    const savedSearches = category === SAVED_SEARCHES;

    if (savedSearches || category === LAST_SEARCHES) {
      return (
        <View style={[styles.sectionHeader, !savedSearches && {paddingTop: SECTION_SPACING}]}>
          <Text style={styles.sectionHeaderText}>{savedSearches ? 'SAVED SEARCHES' : 'RECENT SEARCHES'}</Text>
        </View>
      );
    }
    return null;
  };


  render() {
    return (
      <View style={[styles.container, this.props.style]}>
        <ListView
          style={styles.list}
          dataSource={this.state.dataSource}
          stickySectionHeadersEnabled={false}
          renderRow={this._renderRow}
          renderSectionHeader={this._renderSectionHeader}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  list: {
    overflow: 'visible',
    paddingTop: UNIT * 2,
    paddingBottom: UNIT*2
  },
  searchRow: {
    flex: 1,
    padding: UNIT * 2,
    paddingTop: UNIT * 1.5,
    paddingBottom: UNIT * 1.5,
    paddingRight: UNIT
  },
  sectionHeader: {
    padding: UNIT * 2,
    paddingBottom: 0
  },
  searchText: {
    fontSize: 24,
    fontWeight: '300',
    color: COLOR_FONT_ON_BLACK
  },
  sectionHeaderText: {
    fontWeight: '200',
    fontSize: 16,
    color: COLOR_GRAY
  }
});
