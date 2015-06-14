describe('GenerateSearchRequests service', function() {

  'use strict';

  var service,
      scope;

  var date20130208 = 1360321199999;
  var date20130612 = 1371038399999;

  beforeEach(function() {
    module('inboxApp');
    inject(function(_GenerateSearchRequests_) {
      service = _GenerateSearchRequests_;
    });
    scope = {
      filterModel: {
        type: 'reports',
        forms: [],
        facilities: [],
        date: {}
      },
      filterQuery: {},
      forms: []
    };
  });

  it('creates no requests for no filter', function() {
    var result = service(scope);
    chai.expect(result.length).to.equal(0);
  });

  it('creates no request when all forms selected', function() {
    scope.filterModel.forms = scope.forms = [ { code: 'P' }, { code: 'R' } ];
    var result = service(scope);
    chai.expect(result.length).to.equal(0);
  });

  it('creates requests for reports with forms filter', function() {
    scope.filterModel.forms = [ { code: 'P' }, { code: 'R' } ];
    scope.forms = [ { code: 'P' }, { code: 'R' }, { code: 'D' } ];
    var result = service(scope);
    chai.expect(result.length).to.equal(1);
    chai.expect(result[0].view).to.equal('reports_by_form');
    chai.expect(result[0].params).to.deep.equal({
      keys: [ [ 'P' ], [ 'R' ] ]
    });
  });

  it('creates requests for reports with validity filter true', function() {
    scope.filterModel.valid = true;
    var result = service(scope);
    chai.expect(result.length).to.equal(1);
    chai.expect(result[0].view).to.equal('reports_by_validity');
    chai.expect(result[0].params).to.deep.equal({
      key: [ true ]
    });
  });

  it('creates requests for reports with validity filter false', function() {
    scope.filterModel.valid = false;
    var result = service(scope);
    chai.expect(result.length).to.equal(1);
    chai.expect(result[0].view).to.equal('reports_by_validity');
    chai.expect(result[0].params).to.deep.equal({
      key: [ false ]
    });
  });

  it('creates requests for reports with verification filter true', function() {
    scope.filterModel.verified = true;
    var result = service(scope);
    chai.expect(result.length).to.equal(1);
    chai.expect(result[0].view).to.equal('reports_by_verification');
    chai.expect(result[0].params).to.deep.equal({
      key: [ true ]
    });
  });

  it('creates requests for reports with verification filter false', function() {
    scope.filterModel.verified = false;
    var result = service(scope);
    chai.expect(result.length).to.equal(1);
    chai.expect(result[0].view).to.equal('reports_by_verification');
    chai.expect(result[0].params).to.deep.equal({
      key: [ false ]
    });
  });

  it('creates requests for reports with places filter', function() {
    scope.filterModel.facilities = [ 'a', 'b', 'c' ];
    scope.facilitiesCount = 6;
    var result = service(scope);
    chai.expect(result.length).to.equal(1);
    chai.expect(result[0].view).to.equal('reports_by_place');
    chai.expect(result[0].params).to.deep.equal({
      keys: [ [ 'a' ], [ 'b' ], [ 'c' ] ]
    });
  });

  it('creates requests for reports with date filter', function() {
    scope.filterModel.date.from = date20130208;
    scope.filterModel.date.to = date20130612;
    var result = service(scope);
    chai.expect(result.length).to.equal(1);
    chai.expect(result[0].view).to.equal('reports_by_date');
    chai.expect(result[0].params).to.deep.equal({
      startkey: [ 1360321199999 ],
      endkey: [ 1371124799999 ]
    });
  });

  it('creates requests for reports with exact freetext filters', function() {
    scope.filterQuery.value = 'patient_id:123 form:D';
    var result = service(scope);
    chai.expect(result.length).to.equal(1);
    chai.expect(result[0].view).to.equal('reports_by_freetext');
    chai.expect(result[0].params).to.deep.equal({
      keys: [ [ 'patient_id:123' ], [ 'form:d' ] ]
    });
  });

  it('creates requests for reports with starts with freetext filters', function() {
    scope.filterQuery.value = 'someth';
    var result = service(scope);
    chai.expect(result.length).to.equal(1);
    chai.expect(result[0].view).to.equal('reports_by_freetext');
    chai.expect(result[0].params).to.deep.equal({
      startkey: [ 'someth' ],
      endkey: [ 'someth\ufff0' ],
    });
  });

});
