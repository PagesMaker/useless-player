import {HTTPClient} from "./request.service";

class SearchService {
  getSearchByKeywords(value) {
    return HTTPClient.post(`/search`, {keywords: value});
  }
  getHotSearchList(searchBy) {
    return HTTPClient.get(`/search/hot${searchBy}`);
  }
}
export const searchService = new SearchService();
