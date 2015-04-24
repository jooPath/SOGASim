/**
 * ArchiveController
 *
 * @description :: Server-side logic for managing Archives
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  SOGA: function(req, res){
   //console.log('hihi');
    var SOGA = new SOGASim();
    SOGA.init();
    SOGA.start(1);
    SOGA.start(2);

    res.ok();
  }
};

