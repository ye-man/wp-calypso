/**
 * External dependencies
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import { isEqual } from 'lodash';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Content from './content';
import MediaActions from 'lib/media/actions';
import MediaLibraryDropZone from './drop-zone';
import MediaLibrarySelectedStore from 'lib/media/library-selected-store';
import MediaUtils from 'lib/media/utils';
import filterToMimePrefix from './filter-to-mime-prefix';
import FilterBar from './filter-bar';
import MediaValidationData from 'components/data/media-validation-data';
import QueryPreferences from 'components/data/query-preferences';
import searchUrl from 'lib/search-url';

class MediaLibrary extends Component {
	static propTypes = {
		className: PropTypes.string,
		site: PropTypes.object,
		filter: PropTypes.string,
		enabledFilters: PropTypes.arrayOf( PropTypes.string ),
		search: PropTypes.string,
		source: PropTypes.string,
		onAddMedia: PropTypes.func,
		onFilterChange: PropTypes.func,
		onSourceChange: PropTypes.func,
		onSearch: PropTypes.func,
		onScaleChange: PropTypes.func,
		onEditItem: PropTypes.func,
		fullScreenDropZone: PropTypes.bool,
		containerWidth: PropTypes.number,
		single: PropTypes.bool,
		scrollable: PropTypes.bool,
		postId: PropTypes.number,
	};

	static defaultProps = {
		fullScreenDropZone: true,
		onAddMedia: () => {},
		onScaleChange: () => {},
		scrollable: false,
		source: '',
	};

	doSearch = keywords => {
		searchUrl( keywords, this.props.search, this.props.onSearch );
	};

	onAddMedia = () => {
		const selectedItems = MediaLibrarySelectedStore.getAll( this.props.site.ID );
		let filteredItems = selectedItems;

		if ( ! this.props.site ) {
			return;
		}

		if ( this.props.filter ) {
			// Ensure that items selected as a consequence of this upload match
			// the current filter
			filteredItems = MediaUtils.filterItemsByMimePrefix(
				filteredItems,
				filterToMimePrefix( this.props.filter )
			);
		}

		if ( this.props.single && filteredItems.length > 1 ) {
			// If items were previously selected or multiple files were
			// uploaded, select only the last item
			filteredItems = filteredItems.slice( -1 );
		}

		if ( ! isEqual( selectedItems, filteredItems ) ) {
			MediaActions.setLibrarySelectedItems( this.props.site.ID, filteredItems );
		}

		this.props.onAddMedia();
	}

	filterRequiresUpgrade() {
		const { filter, site } = this.props;
		switch ( filter ) {
			case 'audio':
				return ! ( site && site.options.upgraded_filetypes_enabled || site.jetpack );

			case 'videos':
				return ! ( site && site.options.videopress_enabled || site.jetpack );
		}

		return false;
	}

	renderDropZone() {
		if ( this.props.source !== '' ) {
			return null;
		}

		return (
			<MediaLibraryDropZone
				site={ this.props.site }
				filter={ this.props.filter }
				fullScreen={ this.props.fullScreenDropZone }
				onAddMedia={ this.onAddMedia } />
		);
	}

	render() {
		let content;

		content = (
			<Content
				site={ this.props.site }
				filter={ this.props.filter }
				filterRequiresUpgrade={ this.filterRequiresUpgrade() }
				search={ this.props.search }
				source={ this.props.source }
				containerWidth={ this.props.containerWidth }
				single={ this.props.single }
				scrollable={ this.props.scrollable }
				onAddMedia={ this.onAddMedia }
				onAddAndEditImage={ this.props.onAddAndEditImage }
				onMediaScaleChange={ this.props.onScaleChange }
				selectedItems={ this.props.mediaLibrarySelectedItems }
				onDeleteItem={ this.props.onDeleteItem }
				onEditItem={ this.props.onEditItem }
				onViewDetails={ this.props.onViewDetails }
				postId={ this.props.postId } />
		);

		if ( this.props.site ) {
			content = (
				<MediaValidationData siteId={ this.props.site.ID }>
					{ content }
				</MediaValidationData>
			);
		}

		const classes = classNames(
			'media-library',
			{ 'is-single': this.props.single },
			this.props.className,
		);

		return (
			<div className={ classes }>
				<QueryPreferences />
				{ this.renderDropZone() }
				<FilterBar
					site={ this.props.site }
					filter={ this.props.filter }
					filterRequiresUpgrade={ this.filterRequiresUpgrade() }
					enabledFilters={ this.props.enabledFilters }
					search={ this.props.search }
					onFilterChange={ this.props.onFilterChange }
					source={ this.props.source }
					onSearch={ this.doSearch }
					post={ !! this.props.postId } />
				{ content }
			</div>
		);
	}
}

export default MediaLibrary;
