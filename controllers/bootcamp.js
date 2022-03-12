// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public

exports.getBootcamps = function (req, res) {
    res.status(200).json({
        status: 'success',
        data: 'get all bootcamps'
    })
}
// @desc    create bootcamps
// @route   POST /api/v1/bootcamps
// @access  Private

exports.createBootcamp = function (req, res) {
    res.status(200).json({
        status: 'success',
        data: 'create bootcamp'
    })
}

// @desc    Get single bootcamps
// @route   GET /api/v1/bootcamps/:id
// @access  Public

exports.getBootcamp = function (req, res) {
    res.status(200).json({
        status: 'success',
        id: req.params.id,
        data: `got single bootcamp`
    })
}
// @desc    Update single bootcamps
// @route   PUT /api/v1/bootcamps/:id
// @access  Private

exports.updateBootcamp = function (req, res) {
    res.status(200).json({
        status: 'success',
        id: req.params.id,
        data: `updated single bootcamp`
    })
}

// @desc    Delete single bootcamps
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private

exports.deleteBootcamp = function (req, res) {
    res.status(200).json({
        status: 'success',
        id: req.params.id,
        data: `deleted single bootcamp`
    })
}