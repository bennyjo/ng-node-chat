describe( 'uiCountNewlines', function () {
	var uiCountNewlinesFactory;

	beforeEach( module( 'uiCountNewlines' ));

	beforeEach( inject( function( uiCountNewlines ) {
		uiCountNewlinesFactory = uiCountNewlines;
	}));

	it( 'returns the length of a text', function() {
		expect( uiCountNewlinesFactory('here is a text') ).toBe(14);
	});
});