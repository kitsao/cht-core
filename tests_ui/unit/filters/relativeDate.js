describe('relativeDate filter', function() {

  'use strict';

  var compile,
      scope;

  beforeEach(function() {
    module('inboxApp');
    module(function ($provide) {
      $provide.value('FormatDate', {
        datetime: function() {
          return 'day 0';
        },
        relative: function() {
          return 'sometime';
        }
      });
    });
    inject(function(_$compile_, _$rootScope_) {
      compile = _$compile_;
      scope = _$rootScope_.$new();
    });
  });

  it('should render nothing when no date', function() {
    scope.date = undefined;
    var element = compile('<div ng-bind-html="date | relativeDate"></div>')(scope);
    scope.$digest();
    chai.expect(element.html()).to.equal('<span></span>');
  });

  it('should render date', function() {
    scope.date = moment().valueOf();
    var element = compile('<div ng-bind-html="date | relativeDate"></div>')(scope);
    scope.$digest();
    chai.expect(element.find('span').attr('title')).to.equal('day 0');
    chai.expect(element.text()).to.equal('sometime');
  });

});
