const SETTING_NAME = 'contact_summary';

/**
 * Service for generating summary information based on a given
 * contact and reports about them.
 * Documentation: https://docs.communityhealthtoolkit.org/apps/reference/contact-page/#contact-summary
 */
angular.module('inboxServices').service('ContactSummary',
  function(
    $filter,
    $log,
    Feedback,
    Settings
  ) {

    'use strict';
    'ngInject';

    let generatorFunction;

    const getGeneratorFunction = function() {
      if (!generatorFunction) {
        generatorFunction = Settings()
          .then(function(settings) {
            return settings[SETTING_NAME];
          })
          .then(function(script) {
            if (!script) {
              return function() {};
            }
            return new Function('contact', 'reports', 'lineage', 'targetDoc', script);
          });
      }
      return generatorFunction;
    };

    const applyFilter = function(field) {
      if (field && field.filter) {
        try {
          field.value = $filter(field.filter)(field.value);
        } catch(e) {
          throw new Error('Unknown filter: ' + field.filter + '. Check your configuration.', e);
        }
      }
    };

    const applyFilters = function(summary) {
      $log.debug('contact summary eval result', summary);

      summary = summary || {};
      summary.fields = (summary.fields && Array.isArray(summary.fields)) ? summary.fields : [];
      summary.cards = (summary.cards && Array.isArray(summary.cards)) ? summary.cards : [];

      summary.fields.forEach(applyFilter);
      summary.cards.forEach(function(card) {
        if (card && card.fields && Array.isArray(card.fields)) {
          card.fields.forEach(applyFilter);
        }
      });
      return summary;
    };

    return function(contact, reports, lineage, targetDoc) {
      return getGeneratorFunction()
        .then(function(fn) {
          try {
            return fn(contact, reports || [], lineage || [], targetDoc);
          } catch (e) {
            $log.error('Configuration error in contact-summary function', e);
            Feedback.submit('Configuration error in contact-summary function: ' + e.message, false);
            throw new Error('Configuration error');
          }
        })
        .then(applyFilters);
    };
  }
);
