import React, { Component } from 'react';
import pixadayApi from '../services/pixabayApi';
import Layout from './Layout';
import Notification from './Notification';
import Modal from './Modal';
import InfiniteScroll from 'react-infinite-scroller';
import SearchBar from './SearchBar';
import Spinner from './Spinner';
import ImageGallery from './ImageGallery';
import '../base.css';

class App extends Component {
  state = {
    images: [],
    page: 1,
    searchQuery: '',
    modalImage: '',
    error: null,
    hasMore: false,
    totalOfImages: 500,
  };

  componentDidUpdate(prevProps, prevState) {
    const prevQuery = prevState.searchQuery;
    const nextQuery = this.state.searchQuery;

    if (prevQuery !== nextQuery) {
      return this.fetchImages();
    }
  }

  fetchImages = async () => {
    const { page, searchQuery, images, totalOfImages } = this.state;
    this.setState(prevState => ({
      page: prevState.page + 1,
    }));
    if (images.length === totalOfImages) {
      return;
    }
    try {
      this.setState({
        hasMore: true,
      });
      const incommingImages = await pixadayApi.fetchImagesWithQuery(
        searchQuery,
        page,
      );
      this.setState(prevState => ({
        images: [...prevState.images, ...incommingImages.hits],
        totalOfImages: incommingImages.total,
      }));
      // console.log(`IMAGES===${images.map(item => item.id)}`);
      // console.log(`SETSET===${[...new Set(images.map(item => item.id))]}`);
    } catch (error) {
      this.setState({ error });
    } finally {
      this.setState({
        hasMore: false,
      });
    }
  };

  openModalOnSelectImage = largeImage => {
    this.setState({
      modalImage: largeImage,
    });
  };

  closeModal = () => {
    return this.setState({
      modalImage: '',
    });
  };

  handleSearchFormSubmit = query => {
    this.setState({
      hasMore: true,
      searchQuery: query,
      images: [],
      page: 1,
      totalOfImages: 500,
    });
  };

  render() {
    const { hasMore, images, error, modalImage } = this.state;

    return (
      <Layout>
        <SearchBar handleSearchFormSubmit={this.handleSearchFormSubmit} />
        {error && (
          <Notification
            message={`Whoops... something went wrong: ${error.message}`}
          />
        )}
        <InfiniteScroll
          initialLoad={false}
          loadMore={this.fetchImages}
          hasMore={hasMore}
          loader={<Spinner key={'Spinner'} />}
        >
          <ImageGallery
            onImageClick={this.openModalOnSelectImage}
            listOfImages={images}
          />
        </InfiniteScroll>
        {modalImage && (
          <Modal closeModal={this.closeModal}>
            <img src={modalImage} alt="" />
          </Modal>
        )}
      </Layout>
    );
  }
}

// {loading && <Spinner />}
// {images.length > 0 && (
//   <ImageGallery
//     onImageClick={this.openModalOnSelectImage}
//     listOfImages={images}
//   />
// )}
// {images.length > 0 && !allImagesGotten && (
//   <IntObsInfiniteScroll fetchImages={this.fetchImages} />
// )}

export default App;
