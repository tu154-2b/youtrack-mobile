/* @flow */
import * as types from './issue-list-action-types';
import {AsyncStorage} from 'react-native';
import ApiHelper from '../../components/api/api__helper';
import {notifyError, resolveError} from '../../components/notification/notification';
import type Api from '../../components/api/api';
import type IssuesListState from './issue-list-reducers';
import type {IssueOnList} from '../../flow/Issue';

const PAGE_SIZE = 10;
const QUERY_STORAGE_KEY = 'YT_QUERY_STORAGE';

type ApiGetter = () => Api;

export function setIssuesQuery(query: string) {
  return {
    type: types.SET_ISSUES_QUERY,
    query
  };
}

export function readStoredIssuesQuery() {
  return async (dispatch: (any) => any, getState: () => IssuesListState) => {
    const query = await AsyncStorage.getItem(QUERY_STORAGE_KEY);
    dispatch({
      type: types.SET_ISSUES_QUERY,
      query: query
    });
  };
}

export function suggestIssuesQuery(query: string, caret: number) {
  return async (dispatch: (any) => any, getState: () => IssuesListState, getApi: ApiGetter) => {
    const api: Api = getApi();
    try {
      const suggestions = query ? await api.getQueryAssistSuggestions(query, caret) : await api.getSavedQueries();
      dispatch({type: types.SUGGEST_QUERY, suggestions});
    } catch (e) {
      notifyError('Failed to load suggestions', e);
      dispatch({type: types.SUGGEST_QUERY, suggestions: []});
    }
  };
}

export function clearAssistSuggestions() {
  return {type: types.CLEAR_SUGGESTIONS};
}

export function listEndReached() {
  return {type: types.LIST_END_REACHED};
}

export function storeIssuesQuery(query: string) {
  return () => {
    AsyncStorage.setItem(QUERY_STORAGE_KEY, query);
  };
}

export function startIssuesLoading() {
  return {type: types.START_ISSUES_LOADING};
}

export function stopIssuesLoading() {
  return {type: types.STOP_ISSUES_LOADING};
}

export function startMoreIssuesLoading() {
  return {type: types.START_LOADING_MORE};
}

export function stopMoreIssuesLoading() {
  return {type: types.STOP_LOADING_MORE};
}

export function receiveIssues(issues: Array<IssueOnList>) {
  return {type: types.RECEIVE_ISSUES, issues, pageSize: PAGE_SIZE};
}

export function cacheIssues(issues: Array<IssueOnList>) {
  return (dispatch: (any) => any, getState: () => IssuesListState) => {
    const cache = getState().issueList.cache;
    cache.store(issues);
  };
}

export function readCachedIssues() {
  return async (dispatch: (any) => any, getState: () => IssuesListState) => {
    const cache = getState().issueList.cache;
    const issues: ?Array<IssueOnList> = await cache.read();
    if (issues && issues.length) {
      dispatch(receiveIssues(issues));
    }
  };
}

export function loadingIssuesError(error: Object) {
  return async (dispatch: (any) => any) => {
    const resolvedError = await resolveError(error);
    dispatch({type: types.LOADING_ISSUES_ERROR, error: resolvedError});
  };
}

export function loadIssues(query: string) {
  return async (dispatch: (any) => any, getState: () => IssuesListState, getApi: ApiGetter) => {
    const api: Api = getApi();
    dispatch(startIssuesLoading());
    try {
      let issues: Array<IssueOnList> = await api.getIssues(query, PAGE_SIZE);
      issues = ApiHelper.fillIssuesFieldHash(issues);
      dispatch(receiveIssues(issues));
      dispatch(cacheIssues(issues));
      if (issues.length < PAGE_SIZE) {
        dispatch(listEndReached());
      }
    } catch (e) {
      dispatch(loadingIssuesError(e));
    } finally {
      dispatch(stopIssuesLoading());
    }
  };
}

export function refreshIssues() {
  return async (dispatch: (any) => any, getState: () => IssuesListState) => {
    dispatch(loadIssues(getState().issueList.query));
  };
}

export function initializeIssuesList() {
  return async (dispatch: (any) => any, getState: () => IssuesListState) => {
    await readStoredIssuesQuery()(dispatch, getState);
    await readCachedIssues()(dispatch, getState);
    dispatch(refreshIssues());
  };
}

export function loadMoreIssues() {
  return async (dispatch: (any) => any, getState: () => IssuesListState, getApi: ApiGetter) => {
    const api: Api = getApi();

    const {isInitialized, isLoadingMore, isRefreshing, loadingError, isListEndReached, skip, issues, query} = getState().issueList;
    if (!isInitialized || isLoadingMore || isRefreshing || loadingError || isListEndReached) {
      return;
    }
    const newSkip = skip + PAGE_SIZE;

    dispatch(startMoreIssuesLoading());

    try {
      let moreIssues: Array<IssueOnList> = await api.getIssues(query, PAGE_SIZE, newSkip);
      moreIssues = ApiHelper.fillIssuesFieldHash(moreIssues);
      const updatedIssues = issues.concat(moreIssues);
      dispatch(receiveIssues(updatedIssues, moreIssues));
      dispatch(cacheIssues(updatedIssues));
      if (moreIssues.length < PAGE_SIZE) {
        dispatch(listEndReached());
      }
    } catch (err) {
      notifyError('Failed to fetch more issues', err);
    } finally {
      dispatch(stopMoreIssuesLoading());
    }
  };
}
