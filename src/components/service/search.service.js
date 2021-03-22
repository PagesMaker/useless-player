import {HTTPClient} from "./request.service";

class SearchService {
  getSearchByKeywords(value) {
    return HTTPClient.post(`/search`, {keywords: value});
  }
}
export const searchService = new SearchService();
