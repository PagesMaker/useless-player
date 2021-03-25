import {HTTPClient} from "./request.service";

class SearchService {
  getSearchByKeywords(value) {
    return HTTPClient.post(`/search`, {keywords: value});
  }
  getHotSearchList(searchBy) {
    return HTTPClient.get(`/search/hot${searchBy}`);
  }
  getSearchAdvice(value) {
    return HTTPClient.get(`/search/suggest?keywords=${value}`);
  }
}
export const searchService = new SearchService();
