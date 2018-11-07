/** @format */

/**
 * Internal dependencies
 */

import {
	GROUP_WPCOM,
	GROUP_JETPACK,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
	TYPE_BUSINESS,
	TYPE_ECOMMERCE,
} from 'lib/plans/constants';
import { findPlansKeys } from 'lib/plans';
import { includesProduct } from 'lib/products-values';
import { abtest } from 'lib/abtest';
import * as steps from './steps';

const BUSINESS_PLANS = []
	.concat( findPlansKeys( { group: GROUP_WPCOM, type: TYPE_ECOMMERCE } ) )
	.concat( findPlansKeys( { group: GROUP_WPCOM, type: TYPE_BUSINESS } ) );

const PERSONAL_PREMIUM_PLANS = []
	.concat( findPlansKeys( { group: GROUP_WPCOM, type: TYPE_PERSONAL } ) )
	.concat( findPlansKeys( { group: GROUP_WPCOM, type: TYPE_PREMIUM } ) );

const JETPACK_PAID_PLANS = []
	.concat( findPlansKeys( { group: GROUP_JETPACK, type: TYPE_PERSONAL } ) )
	.concat( findPlansKeys( { group: GROUP_JETPACK, type: TYPE_PREMIUM } ) )
	.concat( findPlansKeys( { group: GROUP_JETPACK, type: TYPE_BUSINESS } ) );

export default function stepsForProductAndSurvey(
	survey,
	product,
	canChat,
	precancellationChatAvailable
) {
	if ( survey && survey.questionOneRadio === 'couldNotInstall' ) {
		if ( includesProduct( BUSINESS_PLANS, product ) && abtest( 'ATPromptOnCancel' ) === 'show' ) {
			return [ steps.INITIAL_STEP, steps.BUSINESS_AT_STEP, steps.FINAL_STEP ];
		}

		if (
			includesProduct( PERSONAL_PREMIUM_PLANS, product ) &&
			abtest( 'ATUpgradeOnCancel' ) === 'show'
		) {
			return [ steps.INITIAL_STEP, steps.UPGRADE_AT_STEP, steps.FINAL_STEP ];
		}
	}

	if (
		canChat &&
		( includesProduct( BUSINESS_PLANS, product ) ||
			includesProduct( PERSONAL_PREMIUM_PLANS, product ) ) &&
		precancellationChatAvailable
	) {
		return steps.DEFAULT_STEPS_WITH_HAPPYCHAT;
	}

	if ( canChat && includesProduct( JETPACK_PAID_PLANS, product ) ) {
		return steps.DEFAULT_STEPS_WITH_HAPPYCHAT;
	}

	return [ steps.INITIAL_STEP, steps.FINAL_STEP ];
}
