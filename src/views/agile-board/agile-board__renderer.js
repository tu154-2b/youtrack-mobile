/* @flow */

import React from 'react';
import {Text, TouchableOpacity, View, StyleSheet} from 'react-native';

import {IconAngleDown} from '../../components/icon/icon';
import {COLOR_BLACK, COLOR_DARK, COLOR_FONT_GRAY, COLOR_MEDIUM_GRAY, UNIT} from '../../components/variables/variables';
import {mainText} from '../../components/common-styles/issue';

import type {TextStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';


export function renderNavigationItem(item: {
  key: string,
  label: string,
  onPress: () => any,
  textStyle?: TextStyleProp,
  showBottomBorder?: boolean,
  isLoading: boolean
}) {

  return (
    <View style={[styles.navigationItem, item.showBottomBorder ? styles.navigationItemBorder : null]}>
      <TouchableOpacity
        key={item.key}
        style={styles.navigationItemButton}
        disabled={item.isLoading}
        onPress={item.onPress}
      >
        <Text
          style={[
            styles.navigationItemButtonText,
            item.textStyle,
            item.isLoading ? styles.navigationItemButtonTextDisabled : null
          ]}
          numberOfLines={1}
        >
          {`${item.label} `}
        </Text>
        <IconAngleDown
          size={15}
          color={item.isLoading ? COLOR_FONT_GRAY : COLOR_BLACK}
          style={styles.navigationItemButtonIcon}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navigationItem: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: 'transparent'
  },
  navigationItemBorder: {
    borderColor: COLOR_MEDIUM_GRAY
  },
  navigationItemButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: UNIT,
    paddingLeft: 0,
    marginBottom: UNIT,
  },
  navigationItemButtonText: {
    ...mainText,
    fontWeight: '500',
    color: COLOR_DARK
  },
  navigationItemButtonTextDisabled: {
    color: COLOR_FONT_GRAY
  },
  navigationItemButtonIcon: {
    lineHeight: 19
  },
});