/*...*/

// contribute form popup actions

function openContributePopup() {
    var popup = document.getElementById('contribute-popup');
    popup.className = "popup"; // is-visually-hidden";
    //setTimeout(function() {
        //container.className = "MainContainer is-blurred";
        //popup.className = "popup";
    //}, 100);
    //container.parentElement.className = "ModalOpen";
};

function closeContributePopup() {
    var popup = document.getElementById('contribute-popup');
    popup.className = "popup is-hidden is-visually-hidden";
    //body.className = "";
    //container.className = "MainContainer";
    //container.parentElement.className = "";
};

// file upload stuff

<!--for details on local file reading, see https://www.html5rocks.com/en/tutorials/file/dndfiles/ -->
<!--https://web.dev/read-files/ -->
<!--https://gis.stackexchange.com/questions/138155/allow-client-to-upload-layers-to-openlayers-3 -->
<!--https://gis.stackexchange.com/questions/368033/how-to-display-shapefiles-on-an-openlayers-web-mapping-application-that-are-prov
-->
function handleFileUpload(evt) {
    var files = evt.target.files; 
    
    // get file contents as a base64 encoded url string
    const file = files[0];
    fileExtension = file.name.split('.').pop();
    //alert('local file selected: '+file.name+' - '+fileExtension);
    
    if (fileExtension == 'geojson' | fileExtension == 'json') {
        reader = new FileReader();
        reader.onload = function(e) {
            // use reader results to create new source
            var dataURL = reader.result;
            source = new ol.source.Vector({
                url: dataURL,
                format: new ol.format.GeoJSON({}),
                overlaps: false,
            });
            // update the comparisonLayer
            updateComparisonLayerFromGeoJSON(source, zoomToExtent=true);
            // and also populate a table
            source.on('change', function() {
                /////////////////
                // make sure the source contains polygon types
                var features = source.getFeatures();
                var geotype = features[0].getGeometry().getType();
                if (!(['Polygon','MultiPolygon'].includes( geotype ))) {
                    alert('File must contain Polygon or MultiPolygon types, not "'+geotype+'" type');
                    return // exit early
                };

                //////////////
                // custom upload info div
                var div = document.getElementById('comparison-info-div');
                // clear
                div.innerHTML = '';
                // create basic file info
                var info = document.createElement("div");
                info.style = "margin-left:20px; margin-top:15px; font-size:0.7em";
                info.innerHTML = '';
                info.innerHTML += '<b>File Name: </b>'+file.name+'<br>';
                info.innerHTML += '<b>File Size: </b>'+(file.size/1000000.0).toFixed(1)+' MB<br>';
                info.innerHTML += '<b>Last Modified: </b>'+file.lastModifiedDate.toISOString().substring(0,10);
                info.innerHTML += '<br><br>';
                div.appendChild(info);
                // and upload button
                var uploadbut = document.createElement("button");
                uploadbut.id = "open-contribute-popup";
                uploadbut.style = "font-size:0.7em";
                uploadbut.textContent = "Share My Data";
                div.appendChild(uploadbut);
                uploadbut.addEventListener('click', openContributePopup);

                // update other display stuff
                //updateComparisonInfo(features);
                updateComparisonStats(features);
                updateComparisonFieldsDropdown(features);
                updateComparisonNames(features);
                //updateComparisonTable(features);
            });
        };
        // read as data url
        reader.readAsDataURL(file);
    } else if (fileExtension == 'zip') {
        loadshp({
                url: file, // path or your upload file
                encoding: 'utf-8', // default utf-8
                EPSG: 4326, // default 4326
                },
                function(geojson) {
                    // geojson returned
                    var features = new ol.format.GeoJSON().readFeatures(geojson,
                                                                        { featureProjection: map.getView().getProjection() }
                                                                        );
                    source = new ol.source.Vector({
                        features: features,
                        format: new ol.format.GeoJSON({}),
                        overlaps: false,
                    });
                    // make sure the source contains polygon types
                    var features = source.getFeatures();
                    var geotype = features[0].getGeometry().getType();
                    if (!(['Polygon','MultiPolygon'].includes( geotype ))) {
                        alert('File must contain Polygon or MultiPolygon types, not "'+geotype+'" type');
                        return // exit early
                    };
                    
                    // update the comparisonLayer
                    // NOTE: doesn't zoom, because that's only onchange for url sources...
                    updateComparisonLayerFromGeoJSON(source, zoomToExtent=true);

                    // or manual version
                    //comparisonLayer.setSource(source);
                    // zoom to new source after source has finished loading
                    //alert('new bbox: '+source.getExtent());
                    // get combined extent of gb and uploaded file
                    //extent = ol.extent.createEmpty();
                    //ol.extent.extend(extent, source.getExtent());
                    //ol.extent.extend(extent, gbLayer.getSource().getExtent());
                    // zoom to extent
                    //map.getView().fit(extent);
                    // zoom out a little
                    //map.getView().setZoom(map.getView().getZoom()-1);

                    //////////////
                    // custom upload info div
                    var div = document.getElementById('comparison-info-div');
                    // clear
                    div.innerHTML = '';
                    // create basic file info
                    var info = document.createElement("div");
                    info.style = "margin-left:20px; margin-top:15px; font-size:0.7em";
                    info.innerHTML = '';
                    info.innerHTML += '<b>File Name: </b>'+file.name+'<br>';
                    info.innerHTML += '<b>File Size: </b>'+(file.size/1000000.0).toFixed(1)+' MB<br>';
                    info.innerHTML += '<b>Last Modified: </b>'+file.lastModifiedDate.toISOString().substring(0,10);
                    info.innerHTML += '<br><br>';
                    div.appendChild(info);
                    // and upload button
                    var uploadbut = document.createElement("button");
                    uploadbut.id = "open-contribute-popup";
                    uploadbut.style = "font-size:0.7em";
                    uploadbut.textContent = "Share My Data";
                    div.appendChild(uploadbut);
                    uploadbut.addEventListener('click', openContributePopup);

                    // update display stuff
                    //updateComparisonInfo(features);
                    updateComparisonStats(features);
                    updateComparisonFieldsDropdown(features);
                    updateComparisonNames(features);
                    //updateComparisonTable(features);
                }
        );
    };
};

function initFileUploadComparisonInfo() {
    var div = document.getElementById('comparison-info-div');
    
    // set basic layout
    div.innerHTML = '\
        <span class="fas fa-file" style="padding:0px 3px important! width:auto"> \
        <input class="fas" type="file" id="file-input" accept=".geojson,.zip"> \
        </span> \
        \
        <span data-text="Upload a zipped shapefile, geoJSON or topoJSON.  Expects WGS84 (EPSG 4326)." class="tooltip"> \
        (?) \
        </span> \
    ';
    
    // bind file input action
    document.getElementById('file-input').addEventListener('change', handleFileUpload, false);
};


// gb display stuff

function updateGbInfo(features) {
    // remove old div if exists
    var div = document.getElementById('gb-file-info');
    if (div) {
        div.remove();
    };
    // info div
    var div = document.createElement("div");
    div.id = 'gb-file-info';
    document.getElementById('gb-info-div').appendChild(div);
    // get gb metadata
    var iso = document.getElementById('country-select').value;
    var level = document.getElementById('admin-level-select').value;
    var license = document.getElementById('license-select').value;
    var metadata = gbMetadata[license];
    // loop metadata table until reach row matching current iso and level
    for (row of metadata) {
        var rowIso = row[2];
        var rowLevel = row[4];
        if (rowIso == iso & rowLevel == level) {
            var gbSource = row[6];
            if (row[7] != '') {
                gbSource += ' / ' + row[7];
            };
            var gbSourceUrl = row[11].replace('https//', 'https://'); // fix url typos
            var gbLicense = row[8];
            var gbLicenseUrl = row[10].replace('https//', 'https://'); // fix url typos
            var gbYear = row[3];
            var gbUpdated = row[12];
            var gbDownloadUrl = 'https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/sourceData/gb'+license+'/'+iso+'_'+level+'.zip'; // maybe use csv apiUrl once that's fixed? 
            break;
        };
    };
    // populate info
    var info = document.createElement("div");
    info.style = "margin-left:20px; margin-top:15px; font-size:0.7em";
    info.innerHTML = '';
    info.innerHTML += '<div><b style="vertical-align:middle">Actions: </b><a href="'+gbDownloadUrl+'" download><img src="https://icons-for-free.com/iconfiles/png/512/file+download+24px-131985219323992544.png" height="20px" style="vertical-align:middle"></a></div>';
    info.innerHTML += '<b>Source: </b><a href="'+gbSourceUrl+'" target="_blank">'+gbSource+'</a><br>';
    info.innerHTML += '<b>License: </b><a href="'+gbLicenseUrl+'" target="_blank">'+gbLicense+'</a><br>';
    info.innerHTML += '<b>Year the Boundary Represents: </b>'+gbYear+'<br>';
    info.innerHTML += '<b>Last Update: </b>'+gbUpdated;
    div.appendChild(info);

    // also update some redundant fields in the stats tables
    document.getElementById('stats-gb-source').innerHTML = '<a href="'+gbSourceUrl+'" target="_blank">'+gbSource+'</a>';
    document.getElementById('stats-gb-license').innerHTML = '<a href="'+gbLicenseUrl+'" target="_blank">'+gbLicense+'</a>';
    document.getElementById('stats-gb-year').innerHTML = gbYear;
    document.getElementById('stats-gb-updated').innerHTML = gbUpdated;
};

function updateGbStats(features) {
    // calc stats
    var stats = calcSpatialStats(features);
    //alert(JSON.stringify(stats));
    // show in display
    var sel = document.getElementById('license-select');
    var name = sel.options[sel.selectedIndex].text;
    document.getElementById('stats-gb-name').innerText = name;
    var lvl = document.getElementById('admin-level-select').value;
    document.getElementById('stats-gb-level').innerText = lvl;
    document.getElementById('stats-gb-area').innerText = stats.area.toLocaleString('en-US', {maximumFractionDigits:0}) + ' km2';
    document.getElementById('stats-gb-circumf').innerText = stats.circumf.toLocaleString('en-US', {maximumFractionDigits:0}) + ' km';
    document.getElementById('stats-gb-vertices').innerText = stats.vertices.toLocaleString('en-US', {maximumFractionDigits:0});
    document.getElementById('stats-gb-avglinedens').innerText = stats.avgLineDensity.toFixed(1) + ' / km';
    document.getElementById('stats-gb-avglineres').innerText = stats.avgLineResolution.toFixed(1) + ' m';
    document.getElementById('stats-gb-admincount').innerText = stats.adminCount;
};

function updateGbNames(features) {
    ////////////////////
    // table div
    // clear old table rows if exists
    var tbody = document.getElementById('gb-names-table-tbody');
    tbody.innerHTML = "";
    // sort by name
    features.sort(function (a,b) {
                    if (a.getProperties()['shapeName'] < b.getProperties()['shapeName']) {
                        return -1;
                    } else {
                        return 1;
                    };
                });
    // add rows
    i = 1;
    for (feature of features) {
        var row = document.createElement("tr");
        // name
        var cell = document.createElement("td");
        var name = feature.getProperties()['shapeName'];
        var ID = feature.getId();
        var getFeatureJs = 'gbLayer.getSource().getFeatureById('+ID+')';
        var onclick = 'openFeatureComparePopup('+getFeatureJs+',null)';
        cell.innerHTML = '<a style="cursor:pointer" onclick="'+onclick+'">'+name+'</a>';
        row.appendChild(cell);
        // empty relation
        var cell = document.createElement("td");
        cell.innerText = '-';
        row.appendChild(cell);
        // add row
        tbody.appendChild(row);
    };
};

function updateGbTable(features) {
    ////////////////////
    // table div
    // remove old div if exists
    var div = document.getElementById('gb-file-preview');
    if (div) {
        div.remove();
    };
    // create table div
    var div = document.createElement("div");
    div.id = 'gb-file-preview';
    div.style = 'max-height:500px; overflow:scroll; margin-top:10px';
    document.getElementById('left-table-div').appendChild(div);
    // create table
    var table = document.createElement("table");
    table.id = 'gb-file-table';
    table.style = 'margin-left:10px';
    div.appendChild(table);
    // first headers
    for (feature of features) {
        var row = document.createElement("tr");
        // empty header for feature number
        var cell = document.createElement("th");
        cell.style = 'width:20px';
        row.appendChild(cell);
        // field headers
        var props = feature.getProperties();
        for (key in props) {
            if (key == 'geometry') {continue};
            var cell = document.createElement("th");
            cell.innerHTML = key;
            row.appendChild(cell);
        };
        table.appendChild(row);
        break;
    };
    // then rows
    i = 1;
    for (feature of features) {
        var row = document.createElement("tr");
        // feature number
        var cell = document.createElement("td");
        cell.style = 'width:20px';
        cell.innerHTML = i;
        row.appendChild(cell);
        i++;
        // feature properties
        var props = feature.getProperties();
        for (key in props) {
            if (key == 'geometry') {continue};
            var cell = document.createElement("td");
            var val = props[key];
            cell.innerHTML = val;
            row.appendChild(cell);
        };
        table.appendChild(row);
    };
};


// gb metadata stuff

var gbMetadata = {};

function updateGbCountryDropdown() {
    // NOTE: requires that gbMetadata has already been populated
    // get country dropdown
    var select = document.getElementById('country-select');
    // clear all existing dropdown options
    select.innerHTML = '';
    // get gb metadata
    var license = document.getElementById('license-select').value;
    var metadata = gbMetadata[license];
    // get list of unique countries
    var countriesSeen = [];
    var countries = [];
    for (var i = 1; i < metadata.length; i++) {
        var row = metadata[i];
        if (row.length <= 1) {
            // ignore empty rows
            i++;
            continue;
        };
        var name = row[1];
        var iso = row[2];
        var country = {'name':name, 'iso':iso};
        if (!(countriesSeen.includes(country.iso))) {
            // only add if hasn't already been added
            countries.push(country);
            countriesSeen.push(country.iso);
        };
    };
    // sort
    countries.sort(function( a,b ){ if (a.name > b.name) {return 1} else {return -1} })
    // add new options from gbMetadata
    for (country of countries) {
        var opt = document.createElement("option");
        opt.value = country.iso;
        opt.textContent = country.name;
        select.appendChild(opt);
    };
    // set the country to get-param if specified
    const urlParams = new URLSearchParams(window.location.search);
    var iso = urlParams.get('country');
    if ((iso != null) & (iso != select.value)) {
        select.value = iso;
    };
};

function updateGbCountries(license=null) {
    // determine license dynamically from the dropdown if not specified
    if (license == null) {
        license = document.getElementById('license-select').value;
    };
    // fetch metadata from the specified license if doesn't already in gbMetadata
    if (!(license in gbMetadata)) {
        // determine url of metadata csv
        url = 'https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/geoBoundaries'+license+'-meta.csv';
        // define error and success
        function error (err, file, inputElem, reason) {
            alert('geoBoundaries metadata csv failed to load: '+url);
        };
        function success (result) {
            // add the downloaded metadata to gbMetadata
            gbMetadata[license] = result['data'];
            // update the dropdown
            updateGbCountryDropdown();
            updateGbAdminLevelDropdown();
            //gbAdminLevelChanged();
            updateGbLayer(zoomToExtent=true);
            updateComparisonBoundaries();
        };
        // parse
        Papa.parse(url,
                    {'download':true,
                    'complete':success,
                    'error':error,
                    }
        );
    } else {
        // metadata already exists, just update the dropdown
        updateGbCountryDropdown();
        updateGbAdminLevelDropdown();
        //gbAdminLevelChanged();
        updateGbLayer(zoomToExtent=true);
        updateComparisonBoundaries();
    };
};

function updateGbAdminLevelDropdown() {
    // NOTE: requires that gbMetadata has already been populated
    // get admin-level dropdown
    var select = document.getElementById('admin-level-select');
    var selectVal = select.value;
    // clear all existing dropdown options
    select.innerHTML = '';
    // get gb metadata
    var license = document.getElementById('license-select').value;
    var metadata = gbMetadata[license];
    // get current country
    var currentIso = document.getElementById('country-select').value;
    // find available admin-levels for country
    var adminLevelsSeen = [];
    var adminLevels = [];
    for (var i = 1; i < metadata.length; i++) {
        var row = metadata[i];
        if (row.length <= 1) {
            // ignore empty rows
            i++;
            continue;
        };
        var iso = row[2];
        var lvl = row[4];
        if (iso == currentIso) {
            if (!(adminLevelsSeen.includes(lvl))) {
                // only add if hasn't already been added
                adminLevels.push(lvl);
                adminLevelsSeen.push(lvl);
            };
        };
    };
    // sort
    adminLevels.sort()
    // add new options from gbMetadata
    for (lvl of adminLevels) {
        var opt = document.createElement("option");
        opt.value = lvl;
        opt.textContent = lvl;
        select.appendChild(opt);
    };
    // keep the select on the same value (if still available)
    //if (adminLevels.includes(selectVal)) {
    //	select.value = selectVal; 
    //};
    // set the adm level to get-param if specified
    const urlParams = new URLSearchParams(window.location.search);
    var lvl = urlParams.get('mainLevel');
    if ((lvl != null) & (lvl != select.value[3])) {
        select.value = 'ADM'+lvl;
    };
    // force dropdown change
    gbAdminLevelChanged();
};


// comparison display stuff

function clearComparisonInfo() {
    // clear old div contents if exists
    var div = document.getElementById('comparison-info-div');
    div.innerHTML = '';
};

function updateComparisonInfo(features) {
    //alert('update comparison info');
    // info div
    var div = document.getElementById('comparison-info-div');
    // clear
    div.innerHTML = '';
    // get geoContrast metadata
    var iso = document.getElementById('country-select').value;
    var level = document.getElementById('admin-level-select').value;
    var sourceName = document.getElementById('comparison-boundary-select').value;
    var metadata = geoContrastMetadata;
    // loop metadata table until reach row matching current iso and level
    for (row of metadata) {
        var rowIso = row[2];
        var rowLevel = row[4];
        var rowSource = row[6];
        if (rowSource == sourceName & rowIso == iso & rowLevel == level) {
            var comparisonSource = row[6];
            if (row[7] != '') {
                comparisonSource += ' / ' + row[7];
            };
            var comparisonSourceUrl = row[11];
            var comparisonLicense = row[8];
            var comparisonLicenseUrl = row[10];
            var comparisonYear = row[3];
            var comparisonUpdated = row[12];
            var comparisonDownloadUrl = 'https://raw.githubusercontent.com/wmgeolab/geoContrast/main/releaseData/'+sourceName+'/'+iso+'/'+level+'/'+sourceName+'_'+iso+'_'+level+'.topojson'; // should point to zipfile? also maybe use csv apiUrl once that's fixed? 
            break;
        };
    };
    // populate info
    var info = document.createElement("div");
    info.style = "margin-left:20px; margin-top:15px; font-size:0.7em";
    info.innerHTML = '';
    info.innerHTML += '<div><b style="vertical-align:middle">Actions: </b><a href="'+comparisonDownloadUrl+'" download><img src="https://icons-for-free.com/iconfiles/png/512/file+download+24px-131985219323992544.png" height="20px" style="vertical-align:middle"></a></div>';
    info.innerHTML += '<b>Source: </b><a href="'+comparisonSourceUrl+'" target="_blank">'+comparisonSource+'</a><br>';
    info.innerHTML += '<b>License: </b><a href="'+comparisonLicenseUrl+'" target="_blank">'+comparisonLicense+'</a><br>';
    info.innerHTML += '<b>Year the Boundary Represents: </b>'+comparisonYear+'<br>';
    info.innerHTML += '<b>Last Update: </b>'+comparisonUpdated;
    div.appendChild(info);

    // also update some redundant fields in the stats tables
    document.getElementById('stats-comp-source').innerHTML = '<a href="'+comparisonSourceUrl+'" target="_blank">'+comparisonSource+'</a>';
    document.getElementById('stats-comp-license').innerHTML = '<a href="'+comparisonLicenseUrl+'" target="_blank">'+comparisonLicense+'</a>';
    document.getElementById('stats-comp-year').innerHTML = comparisonYear;
    document.getElementById('stats-comp-updated').innerHTML = comparisonUpdated;
};

function clearComparisonTable() {
    // remove old div if exists
    var div = document.getElementById('comparison-file-preview');
    if (div) {
        div.remove();
    };
};

function updateComparisonStats(features) {
    // calc stats
    var stats = calcSpatialStats(features);
    //alert(JSON.stringify(stats));
    // show in display
    var name = document.getElementById('comparison-boundary-select').value;
    document.getElementById('stats-comp-name').innerText = name;
    var lvl = document.getElementById('comparison-admin-level-select').value;
    document.getElementById('stats-comp-level').innerText = lvl;
    document.getElementById('stats-comp-area').innerText = stats.area.toLocaleString('en-US', {maximumFractionDigits:0}) + ' km2';
    document.getElementById('stats-comp-circumf').innerText = stats.circumf.toLocaleString('en-US', {maximumFractionDigits:0}) + ' km';
    document.getElementById('stats-comp-vertices').innerText = stats.vertices.toLocaleString('en-US', {maximumFractionDigits:0});
    document.getElementById('stats-comp-avglinedens').innerText = stats.avgLineDensity.toFixed(1) + ' / km';
    document.getElementById('stats-comp-avglineres').innerText = stats.avgLineResolution.toFixed(1) + ' m';
    document.getElementById('stats-comp-admincount').innerText = stats.adminCount;
};

function updateComparisonFieldsDropdown(features) {
    // get all text fieldnames
    var feature = features[0];
    var fields = [];
    var props = feature.getProperties();
    for (key in props) {
        if (key == 'geometry') {continue};
        val = props[key];
        if (typeof val === 'string') {
            fields.push(key);
        };
    };
    // update the dropdown
    var select = document.getElementById('comparison-names-table-select');
    select.innerHTML = "";
    for (field of fields) {
        var opt = document.createElement('option');
        opt.value = field;
        opt.textContent = field;
        select.appendChild(opt);
    };
    // auto set name field
    fields.sort(function (a,b) {
        if (a.toLowerCase().includes('name') & b.toLowerCase().includes('name')) {
            if (a.length < b.length) {
                return -1;
            } else {
                return 1;
            }
        } else if (a.toLowerCase().includes('name')) {
            return -1;
        } else if (b.toLowerCase().includes('name')) {
            return 1;
        } else {
            return 0;
        };
    });
    autofield = fields[0];
    select.value = autofield;
};

function updateComparisonNames(features) {
    ////////////////////
    // table div
    // clear old table rows if exists
    var tbody = document.getElementById('comparison-names-table-tbody');
    tbody.innerHTML = "";
    // get name from dropdown
    var nameField = document.getElementById('comparison-names-table-select').value;
    // sort by name
    features.sort(function (a,b) {
                    if (a.getProperties()[nameField] < b.getProperties()[nameField]) {
                        return -1;
                    } else {
                        return 1;
                    };
                });
    // add rows
    i = 1;
    for (feature of features) {
        var row = document.createElement("tr");
        // name
        var cell = document.createElement("td");
        var name = feature.getProperties()[nameField];
        var ID = feature.getId();
        var getFeatureJs = 'comparisonLayer.getSource().getFeatureById('+ID+')';
        var onclick = 'openFeatureComparePopup(null,'+getFeatureJs+')';
        cell.innerHTML = '<a style="cursor:pointer" onclick="'+onclick+'">'+name+'</a>';
        row.appendChild(cell);
        // empty relation
        var cell = document.createElement("td");
        cell.innerText = '-';
        row.appendChild(cell);
        // add row
        tbody.appendChild(row);
    };
};

function comparisonFieldsDropdownChanged() {
    var features = comparisonLayer.getSource().getFeatures();
    updateComparisonNames(features);
};

function updateComparisonTable(features) {
    ////////////////////
    // table div
    // remove old div if exists
    var div = document.getElementById('comparison-file-preview');
    if (div) {
        div.remove();
    };
    // create table div
    var div = document.createElement("div");
    div.id = 'comparison-file-preview';
    div.style = 'max-height:500px; overflow:scroll; margin-top:10px';
    document.getElementById('right-table-div').appendChild(div);
    // create table
    var table = document.createElement("table");
    table.id = 'comparison-file-table';
    table.style = 'margin-left:10px';
    div.appendChild(table);
    // first headers
    for (feature of features) {
        var row = document.createElement("tr");
        // empty header for feature number
        var cell = document.createElement("th");
        cell.style = 'width:20px';
        row.appendChild(cell);
        // field headers
        var props = feature.getProperties();
        for (key in props) {
            if (key == 'geometry') {continue};
            var cell = document.createElement("th");
            cell.innerHTML = key;
            row.appendChild(cell);
        };
        table.appendChild(row);
        break;
    };
    // then rows
    i = 1;
    for (feature of features) {
        var row = document.createElement("tr");
        // feature number
        var cell = document.createElement("td");
        cell.style = 'width:20px';
        cell.innerHTML = i;
        row.appendChild(cell);
        i++;
        // feature properties
        var props = feature.getProperties();
        for (key in props) {
            if (key == 'geometry') {continue};
            var cell = document.createElement("td");
            var val = props[key];
            cell.innerHTML = val;
            row.appendChild(cell);
        };
        table.appendChild(row);
    };
};


// comparison metadata stuff

var geoContrastMetadata = null;

function updateComparisonBoundaries() {
    // fetch metadata if doesn't already exist in geoContrastMetadata
    if (geoContrastMetadata == null) {
        // determine url of metadata csv
        url = 'https://raw.githubusercontent.com/wmgeolab/geoContrast/main/releaseData/geoContrast-meta.csv';
        // define error and success
        function error (err, file, inputElem, reason) {
            alert('geoContrast metadata csv failed to load: '+url);
        };
        function success (result) {
            // add the downloaded metadata to gbMetadata
            geoContrastMetadata = result['data'];
            // update the dropdown
            // ???
            updateComparisonBoundaryDropdown();
        };
        // parse
        Papa.parse(url,
                    {'download':true,
                    'complete':success,
                    'error':error,
                    }
        );
    } else {
        // metadata already exists, just update the dropdown
        // ???
        updateComparisonBoundaryDropdown();
    };
};

function updateComparisonBoundaryDropdown() {
    //alert('update comparison boundary dropdown');
    // get admin-level dropdown
    var select = document.getElementById('comparison-boundary-select');
    var selectVal = select.value;
    // clear all existing dropdown options
    select.innerHTML = '';
    // get current country
    var currentIso = document.getElementById('country-select').value;
    // get geoContrast metadata
    var metadata = geoContrastMetadata;
    // get list of sources that match the specified country
    var sources = [];
    var sourcesSeen = [];
    for (var i = 1; i < metadata.length; i++) {
        var row = metadata[i];
        if (row.length <= 1) {
            // ignore empty rows
            i++;
            continue;
        };
        var source = row[6];
        var iso = row[2];
        var level = row[4];
        if (iso==currentIso) {
            if (!(sourcesSeen.includes(source))) {
                // only add if hasn't already been added
                sourcesSeen.push(source);
                sources.push(source);
            };
        };
    };
    // sort
    sources.sort()
    // add new options from geoContrastMetadata
    for (source of sources) {
        var opt = document.createElement("option");
        opt.value = source;
        opt.textContent = 'Dataset: ' + source;
        select.appendChild(opt);
    };
    // finally add custom upload boundary choice
    opt = document.createElement('option');
    opt.value = 'upload';
    opt.textContent = 'Custom: Your Own Boundary';
    select.appendChild(opt);
    // keep the select on the same value (if still available)
    //if (sources.includes(selectVal)) {
    //	select.value = selectVal; 
    //};
    // set the source to get-param if specified
    const urlParams = new URLSearchParams(window.location.search);
    var source = urlParams.get('comparisonSource');
    if ((source != null) & (source != select.value)) {
        select.value = source;
    };
    // force dropdown change
    comparisonBoundaryChanged();
};

function updateComparisonAdminLevelDropdown() {
    // NOTE: requires that geoContrastMetadata has already been populated
    // get admin-level dropdown
    var select = document.getElementById('comparison-admin-level-select');
    var selectVal = select.value;
    // clear all existing dropdown options
    select.innerHTML = '';
    // get geoContrast metadata
    var metadata = geoContrastMetadata;
    // get current country and comparison source
    var currentIso = document.getElementById('country-select').value;
    var currentComparison = document.getElementById('comparison-boundary-select').value;
    // find available admin-levels for country
    var adminLevelsSeen = [];
    var adminLevels = [];
    for (var i = 1; i < metadata.length; i++) {
        var row = metadata[i];
        if (row.length <= 1) {
            // ignore empty rows
            i++;
            continue;
        };
        var iso = row[2];
        var lvl = row[4];
        var source = row[6];
        if ((iso == currentIso) & (source == currentComparison)) {
            if (!(adminLevelsSeen.includes(lvl))) {
                // only add if hasn't already been added
                adminLevels.push(lvl);
                adminLevelsSeen.push(lvl);
            };
        };
    };
    // sort
    adminLevels.sort()
    // add new options from geoContrastMetadata
    for (lvl of adminLevels) {
        var opt = document.createElement("option");
        opt.value = lvl;
        opt.textContent = lvl;
        select.appendChild(opt);
    };
    // keep the select on the same value (if still available)
    //if (adminLevels.includes(selectVal)) {
    //	select.value = selectVal; 
    //};
    // set the adm level to get-param if specified
    const urlParams = new URLSearchParams(window.location.search);
    var lvl = urlParams.get('comparisonLevel');
    if ((lvl != null) & (lvl != select.value[3])) {
        select.value = 'ADM'+lvl;
    };
    // force dropdown change
    comparisonAdminLevelChanged();
};


// spatial stats stuff
function calcSpatialStats(features) {
    var stats = {};
    var circumf = 0;
    var vertices = 0;
    var area = 0;
    var segLengths = [];
    for (feat of features) {
        var geom = feat.getGeometry();
        circumf += ol.sphere.getLength(geom);
        area += ol.sphere.getArea(geom);
        if (geom.getType() == 'Polygon') {
            // wrap so can treat at multipolygon
            var polys = [geom.getCoordinates()];
        } else {
            var polys = geom.getCoordinates();
        };
        for (poly of polys) {
            for (ring of poly) {
                vertices += ring.length;
            };
            /*
            // poly level aggregate stats
            var ext = poly[0]; // polygon exterior
            vertices += ext.length;
            var line = turf.lineString(ext);
            circumf += turf.length(line);
            var polygon = turf.polygon([ext]);
            area += turf.area(polygon);
            // calc detailed segment lengths
            //for (var i = 1; i < (ext.length-1); i++) {
            //	v1 = ext[i];
            //	v2 = ext[i+1];
            //	var len = turf.length(turf.lineString([v1,v2]));
            //	segLengths.push(len);
            //};
            */
        };
    };
    // store final stats
    stats.adminCount = features.length;
    stats.area = area / 1000000.0; // convert from m2 to km2
    circumf = circumf / 1000.0; // convert from m to km
    stats.circumf = circumf;
    stats.vertices = vertices;
    stats.avgLineResolution = circumf / vertices * 1000; // ie avg vertext-to-vertex segment length ie resolution in meters
    stats.avgLineDensity = vertices / circumf; // ie avg number of vertices per 1 km distance ie density (inverse of line resolution)
    //segLengths.sort(function(a, b) {return a - b});
    //stats.medLineResolution = segLengths[Math.round(segLengths.length/2)]  / 1000.0; // convert from m to km, even though supposed to be km
    return stats;
};


// dropdown change behavior

function updateGetParams() { //param, selectId) {
    const urlParams = new URLSearchParams(window.location.search);
    // set value
    //var select = document.getElementById(selectId);
    //urlParams.set(param, select.value);
    // set country
    var select = document.getElementById('country-select');
    if (select.value == '') {return}; // to avoid errors at startup when not all selects have been populated
    urlParams.set('country', select.value);
    // set main source
    // ... 
    // set comparison source
    var select = document.getElementById('comparison-boundary-select');
    if (select.value == '') {return}; // to avoid errors at startup when not all selects have been populated
    urlParams.set('comparisonSource', select.value);
    // set main adm level
    var select = document.getElementById('admin-level-select');
    if (select.value == '') {return}; // to avoid errors at startup when not all selects have been populated
    urlParams.set('mainLevel', select.value[3]); // only the adm number
    // set comparison adm level
    var select = document.getElementById('comparison-admin-level-select');
    if (select.value == '') {return}; // to avoid errors at startup when not all selects have been populated
    urlParams.set('comparisonLevel', select.value[3]); // only the adm number
    // update url
    //window.location.search = urlParams;
    var newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + urlParams.toString();
    //alert(newUrl);
    window.history.pushState({path:newUrl}, '', newUrl);
};

function gbLicenseChanged() {
    //alert('license changed');
    updateGbCountries();
};

function gbCountryChanged() {
    // this might run updateGbLayer twice, once on updateGbAdminLevelDropdown() since admin-level dropdown changes triggers updateGbLayers, and once on call to updateGbLayer(zoomToExtent=true)...
    // maybe updateGbAdminLevelDropdown() would be sufficient, but if the admin stays the same maybe it doesn't get triggered...
    //alert('country changed');
    updateGbAdminLevelDropdown();
    updateGbLayer(zoomToExtent=true);
    updateComparisonBoundaries();
    updateGetParams();
};

function gbAdminLevelChanged() {
    //alert('main admin-level changed');
    updateGbLayer(zoomToExtent=true);
    updateComparisonBoundaries();
    updateGetParams();
};

function comparisonBoundaryChanged() {
    //alert('comparison source changed');
    comparison = document.getElementById('comparison-boundary-select').value;
    // check which comparison source was selected
    if (comparison == 'none') {
        // empty choice selection, clear elements
        clearComparisonInfo();
        clearComparisonTable();
        // clear comparison layer
        clearComparisonLayer();
        // update admin dropdown
        updateComparisonAdminLevelDropdown();
    } else if (comparison == 'upload') {
        // clear previous elements
        clearComparisonInfo();
        clearComparisonTable();
        // setup the file input elements
        initFileUploadComparisonInfo();
        // clear comparison layer
        clearComparisonLayer();
        // update admin dropdown
        updateComparisonAdminLevelDropdown();
    } else {
        // update admin dropdown
        updateComparisonAdminLevelDropdown();
    };
    updateGetParams();
};

function comparisonAdminLevelChanged() {
    //alert('comparison admin-level changed');
    // if a geoContrast source is selected
    comparison = document.getElementById('comparison-boundary-select').value;
    if ((comparison != 'none') & (comparison != 'upload')) {
        // update comparison layer with external geoContrast topojson
        updateComparisonLayerWithGeoContrast(zoomToExtent=true);
    };
    updateGetParams();
};


// update layer stuff

function zoomGbFeature(ID) {
    var features = gbLayer.getSource().getFeatures();
    // find feature
    for (feature of features) {
        if (feature.getId() == ID) {
            break;
        };
    };
    // zoom to extent
    map.getView().fit(feature.getGeometry().getExtent());
    // zoom out a little
    //map.getView().setZoom(map.getView().getZoom()-1);
};

function zoomComparisonFeature(ID) {
    var features = comparisonLayer.getSource().getFeatures();
    // find feature
    for (feature of features) {
        if (feature.getId() == ID) {
            break;
        };
    };
    // zoom to extent
    map.getView().fit(feature.getGeometry().getExtent());
    // zoom out a little
    //map.getView().setZoom(map.getView().getZoom()-1);
};

function updateGbLayer(zoomToExtent=false) {
    // get user-selected params
    iso3 = document.getElementById('country-select').value;
    level = document.getElementById('admin-level-select').value;
    license = document.getElementById('license-select').value;
    // construct data url from params
    url = 'https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gb'+license+'/'+iso3+'/'+level+'/geoBoundaries-'+iso3+'-'+level+'.topojson';
    //alert(url);
    // create new source
    var source = new ol.source.Vector({
        overlaps: false,
    });
    gbLayer.setSource(source);
    // zoom to new source after source has finished loading
    if (zoomToExtent) {
        source.on('change', function() {
            //alert('gb loaded, zoom to bbox: '+source.getExtent());
            // zoom to extent
            map.getView().fit(source.getExtent());
            // zoom out a little
            map.getView().setZoom(map.getView().getZoom()-1);
        });
    };
    // update the table after source has finished loading
    source.on('change', function() {
        //alert('gb loaded, update info');
        var features = source.getFeatures();
        updateGbStats(features);
        updateGbNames(features);
        //updateGbTable(features);
        updateGbInfo(features);
    });
    // notify if failed to load source
    source.on(['error','featuresloaderror'], function() {
        alert('Failed to load features from '+source.getUrl()+'. Please choose another source.');
    });
    // manually load features from url
    function loadFromTopoJSON(source, topoj) {
        //alert('reading features...');
        var format = new ol.format.TopoJSON({});
        var features = format.readFeatures(topoj, {
                                                    dataProjection: 'EPSG:4326',
                                                    featureProjection: map.getView().getProjection()
                                                }
                                            );
        //alert(features.length + ' features fetched');
        // set ids
        var i = 1;
        for (feat of features) {
            feat.setId(i);
            i++;
        };
        // add
        source.addFeatures(features);
        //alert('features added');
    };
    // fetch the data
    fetch(url)
        .then(resp => resp.json())
        .then(out => loadFromTopoJSON(source, out))
        .catch(err => alert('Failed to load source from '+source.getUrl()+'. Please choose another source. Error: '+JSON.stringify(err)));
};

function clearComparisonLayer() {
    source = new ol.source.Vector({
        url: null,
        format: new ol.format.TopoJSON({}),
        overlaps: false,
    });
    comparisonLayer.setSource(source);
};

function updateComparisonLayerWithGeoContrast(zoomToExtent=false) {
    // get gb params
    iso = document.getElementById('country-select').value;
    // get comparison params
    level = document.getElementById('comparison-admin-level-select').value;
    sourceName = document.getElementById('comparison-boundary-select').value;
    if (sourceName == null) {
        return
    };
    // get geoContrast metadata
    var metadata = geoContrastMetadata;
    // find the data url from the corresponding entry in the meta table
    //url = 'https://raw.githubusercontent.com/wmgeolab/geoContrast/main/releaseData/'+sourceName+'/'+iso3+'/'+level+'/'+sourceName+'_'+iso3+'_'+level+'.topojson';
    for (var i = 1; i < metadata.length; i++) {
        var row = metadata[i];
        if (row.length <= 1) {
            // ignore empty rows
            i++;
            continue;
        };
        var currentIso = row[2];
        var currentLevel = row[4];
        var currentSource = row[6];
        if ((sourceName == currentSource) & (iso == currentIso) & (level == currentLevel)) {
            url = row[18];
            break;
        };
    };
    //alert(url);
    // create new source
    var source = new ol.source.Vector({
        overlaps: false,
    });
    comparisonLayer.setSource(source);
    // update the table after source has finished loading
    if (zoomToExtent) {
        source.on('change', function() {
            //alert('comparison loaded, zoom to bbox: '+source.getExtent());
            // zoom to extent
            map.getView().fit(source.getExtent());
            // zoom out a little
            map.getView().setZoom(map.getView().getZoom()-1);
        });
    };
    // update the table after source has finished loading
    source.on('change', function() {
        //alert('comparison loaded, update info');
        features = source.getFeatures();
        updateComparisonStats(features);
        updateComparisonFieldsDropdown(features);
        updateComparisonNames(features);
        //updateComparisonTable(features);
        updateComparisonInfo(features);
    });
    // notify if failed to load source
    source.on(['error','featuresloaderror'], function() {
        alert('Failed to load features from '+source.getUrl()+'. Please choose another source.');
    });
    // manually load features from url
    function loadFromTopoJSON(source, topoj) {
        //alert('reading features...');
        var format = new ol.format.TopoJSON({});
        var features = format.readFeatures(topoj, {
                                                    dataProjection: 'EPSG:4326',
                                                    featureProjection: map.getView().getProjection()
                                                }
                                            );
        //alert(features.length + ' features fetched');
        // set ids
        var i = 1;
        for (feat of features) {
            feat.setId(i);
            i++;
        };
        // add
        source.addFeatures(features);
        //alert('features added');
    };
    // fetch the data
    fetch(url)
        .then(resp => resp.json())
        .then(out => loadFromTopoJSON(source, out))
        .catch(err => alert('Failed to load source from '+source.getUrl()+'. Please choose another source. Error: '+JSON.stringify(err)));
};

function updateComparisonLayerFromGeoJSON(source, zoomToExtent=false) {
    // set the new source
    comparisonLayer.setSource(source);
    // zoom to new source after source has finished loading
    if (zoomToExtent) {
        source.on('change', function() {
            //alert('new bbox: '+source.getExtent());
            // get combined extent of gb and uploaded file
            extent = ol.extent.createEmpty();
            ol.extent.extend(extent, source.getExtent());
            ol.extent.extend(extent, gbLayer.getSource().getExtent());
            // zoom to extent
            map.getView().fit(extent);
            // zoom out a little
            map.getView().setZoom(map.getView().getZoom()-1);
        });
    };
    // notify if failed to load source
    source.on(['error','featuresloaderror'], function() {
        alert('Failed to load uploaded file.');
    });
};


//-----------------------------------
// this chunk defines boundary comparisons

// helpers
function geoj2turf(geoj) {
    if (geoj.type == 'Polygon') {
        geom = turf.polygon(geoj.coordinates)
    } else if (geoj.type == 'MultiPolygon') {
        geom = turf.multiPolygon(geoj.coordinates)
    };
    return geom;
};

// feature to feature similarity
function robustTurfArea(geom) {
    // WARNING: turf calculates wildly incorrect area estimates, see instead 'olArea'
    // make sure isec rings are correctly sorted (otherwise will get negative area)
    // see https://github.com/Turfjs/turf/issues/1482
    // https://github.com/w8r/martinez/issues/91
    var geomType = turf.getType(geom);
    var coords = turf.getCoords(geom);
    alert('area calc for '+geomType+' '+coords.length+' '+JSON.stringify(coords));
    if (geomType == 'Polygon') {
        // treat as a multipolygon w one polygon
        coords = [coords];
    };
    // reorganize the polygon rings to make sure it's correct
    var allRings = [];
    for (poly of coords) {
        for (ring of poly) {
            /*if (ring[0] != ring[ring.length-1]) {
                ring.push(ring[ring.length-1]);
            };*/
            allRings.push(ring);
        };
    };
    var multiLines = turf.multiLineString(allRings);
    var featureColl = turf.polygonize(multiLines);
    // cumulate the area of each resulting polygon
    var area = 0;
    var pi = 0;
    turf.featureEach(featureColl, function (currentFeature, featureIndex) {
        area = area + turf.area(currentFeature);
        pi++;
    });
    alert('old '+turf.area(geom)+' new '+area);

    /*
    // calc area one ring at a time
    area = 0;
    let ip = 0;
    for (poly of coords) {
        let ir = 0;
        var ringAreas = [];
        for (ring of poly) {
            var ringArea = turf.area(turf.polygon([ring]));
            alert(ip+'-'+ir+', verts '+ring.length+', area '+ringArea);
            //ringArea = Math.abs(ringArea);
            //if (ir > 0) {
            //	ringArea = -ringArea;
            //};
            ringAreas.push(ringArea);
            //area = area + ringArea;
            ir++;
        };
        var extArea = Math.max.apply(Math, ringAreas);
        var sumArea = ringAreas.reduce((a, b) => a + b, 0);
        var holeArea = sumArea - extArea;
        area = area + extArea - holeArea;
        ip++;
    };
    */

    return area;
};

function olArea(geom) {
    var feat = {'type':'Feature', 'properties':{}, 'geometry':{'type':turf.getType(geom), 'coordinates':turf.getCoords(geom)}};
    var olFeat = new ol.format.GeoJSON().readFeature(feat);
    var area = ol.sphere.getArea(olFeat.getGeometry());
    //alert(turf.area(geom)+'-->'+area);
    return area;
};

function olPerimeter(geom) {
    fdsfs;
};

function similarity(feat1, feat2) {
    // create turf objects
    //alert('creating turf geoms');
    geom1 = geoj2turf(turf.simplify(feat1.geometry, {tolerance:0.01}));
    geom2 = geoj2turf(turf.simplify(feat2.geometry, {tolerance:0.01}));

    // exit early if no overlap
    /*
    var [xmin1,ymin1,xmax1,ymax1] = turf.bbox(geom1);
    var [xmin2,ymin2,xmax2,ymax2] = turf.bbox(geom2);
    var boxoverlap = (xmin1 <= xmax2 & xmax1 >= xmin2 & ymin1 <= ymax2 & ymax1 >= ymin2)
    if (!boxoverlap) {
        return {'equality':0, 'within':0, 'contains':0}
    };
    */

    // calc intersection
    //alert('calc intersection');
    var isec = turf.intersect(geom1, geom2);
    if (isec == null) {
        // exit early if no intersection
        return {'equality':0, 'within':0, 'contains':0}
    };

    // calc union
    //alert('calc union');
    var union = turf.union(geom1, geom2);

    // calc metrics
    //alert('calc areas');
    var geom1Area = turf.convertArea(olArea(geom1),'meters','kilometers');
    var geom2Area = turf.convertArea(olArea(geom2),'meters','kilometers');
    var unionArea = turf.convertArea(olArea(union), 'meters', 'kilometers');
    var isecArea = turf.convertArea(olArea(isec), 'meters', 'kilometers');
    var areas = {'geom1Area':geom1Area, 'geom2Area':geom2Area, 'unionArea':unionArea, 'isecArea':isecArea};
    //alert(JSON.stringify(areas));
    
    var results = {};
    results.equality = isecArea / unionArea;
    results.within = isecArea / geom1Area;
    results.contains = isecArea / geom2Area;
    return results;
};

/*function spatialRelation(feat1, feat2, simil) {
    // unfinished...
    if (simil.contains >= 0.1 | simil.within >= 0.1) {
        if (simil.equality >= 0.95) {
            return 'is equal to';
        } else {
            return 'is a subset of';
        };
    };
    // next
    // ...
};*/

function calcSpatialRelations(feat, features) {
    var geojWriter = new ol.format.GeoJSON();
    var geoj1 = geojWriter.writeFeatureObject(feat);
    var matches = [];
    for (feat2 of features) {
        if (!ol.extent.intersects(feat.getGeometry().getExtent(), feat2.getGeometry().getExtent())) {
            continue;
        };
        geoj2 = geojWriter.writeFeatureObject(feat2);
        simil = similarity(geoj1, geoj2);
        if (simil.equality > 0.0) {
            matches.push([feat2,simil]);
        };
        i++;
    };
    return matches;
};

function calcAllSpatialRelations(features1, features2) {
    // calc relations from 1 to 2
    var matches1 = [];
    for (feature1 of features1) {
        var related = calcSpatialRelations(feature1, features2);
        matches1.push([feature1,related]);
    };
    // then reverse the calcs so they go from 2 to 1
    var matches2 = [];
    for (feature2 of features2) {
        var related2 = [];
        for (m1 of matches1) {
            var [f1,related1] = m1;
            for (r1 of related1) {
                var [f2,stats] = r1;
                if (feature2 === f2) {
                    // reverse and add the stats to related
                    newStats = {contains:stats.within, within:stats.contains, equality:stats.equality}
                    related2.push([f1,newStats]);
                };
            };
        };
        matches2.push([feature2,related2]);
    };
    // return both results
    return [matches1, matches2];
};

function sortSpatialRelations(matches, sort_by, thresh, reverse=true) {
    // sort
    function sortFunc(a, b) {
        if (reverse == false) {
            var trueVal = 1;
        } else {
            var trueVal = -1;
        };
        if (a[1][sort_by] < b[1][sort_by]) {
            // a is less than b by some ordering criterion
            return -trueVal;
        };
        if (a[1][sort_by] > b[1][sort_by]) {
            // a is greater than b by the ordering criterion
            return trueVal;
        };
        // a must be equal to b
        return 0;
    };
    matches.sort(sortFunc);

    // filter by threshold
    newMatches = [];
    for (m of matches) {
        if (m[1][sort_by] >= thresh) {
            newMatches.push(m);
        };
    };

    return newMatches;
};

function calcBoundaryMakeupTables() {
    var features = gbLayer.getSource().getFeatures();
    var comparisonFeatures = comparisonLayer.getSource().getFeatures();

    // calculate relations
    var [matches1,matches2] = calcAllSpatialRelations(features, comparisonFeatures);

    // update tables
    updateGbMakeupTable(matches1);
    updateComparisonMakeupTable(matches2);
};

function updateGbMakeupTable(matches) {
    // sort by name
    matches.sort(function (a,b) {
                    if (a[0].getProperties()['shapeName'] < b[0].getProperties()['shapeName']) {
                        return -1;
                    } else {
                        return 1;
                    };
                });

    // sort and filter matches above threshold
    var makeup = [];
    for (match of matches) {
        var [feature,related] = match;
        // sort
        related = sortSpatialRelations(related, 'within', 0);
        // keep any that are significant from the perspective of either boundary (>1% of area)
        var significantRelated = [];
        for (x of related) {
            if ((x[1].within >= 0.01) | (x[1].contains >= 0.01)) { // x[1] is the stats dict
                significantRelated.push(x)
            };
        };
        if (significantRelated.length > 0) {
            makeup.push([feature,significantRelated]);
        };
    };
    
    // populate tables
    var comparisonSelect = document.getElementById('comparison-names-table-select');
    
    // populate makeup table
    var table = document.getElementById('gb-names-table')
    // clear old table rows if exists
    var tbody = document.getElementById('gb-names-table-tbody');
    tbody.innerHTML = "";
    // if any related
    if (makeup.length) {
        // add rows
        for (x of makeup) {
            var [feature,related] = x;
            var row = document.createElement("tr");
            // name
            var cell = document.createElement("td");
            var name = feature.getProperties()['shapeName'];
            var ID = feature.getId();
            var getFeatureJs = 'gbLayer.getSource().getFeatureById('+ID+')';
            var onclick = 'openFeatureComparePopup('+getFeatureJs+',null)';
            cell.innerHTML = '<a style="cursor:pointer" onclick="'+onclick+'">'+name+'</a>';
            row.appendChild(cell);
            // find related boundaries
            var cell = document.createElement("td");
            var cellContent = '';
            for (x of related) {
                [matchFeature,stats] = x;
                var ID2 = matchFeature.getId();
                var name2 = matchFeature.getProperties()[comparisonSelect.value];
                var getFeature1Js = 'gbLayer.getSource().getFeatureById('+ID+')';
                var getFeature2Js = 'comparisonLayer.getSource().getFeatureById('+ID2+')';
                var onclick = 'openFeatureComparePopup('+getFeature1Js+','+getFeature2Js+')';
                var nameLink = '<a style="cursor:pointer" onclick="'+onclick+'">'+name2+'</a>';
                var share = (stats.within * 100).toFixed(1) + '%';
                cellContent += share + ' ' + nameLink + '<br>';
            };
            cell.innerHTML = cellContent;
            row.appendChild(cell);
            // add row
            tbody.appendChild(row);
        };
    };
};

function updateComparisonMakeupTable(matches) {
    var comparisonSelect = document.getElementById('comparison-names-table-select');

    // sort by name
    matches.sort(function (a,b) {
                    if (a[0].getProperties()[comparisonSelect.value] < b[0].getProperties()[comparisonSelect.value]) {
                        return -1;
                    } else {
                        return 1;
                    };
                });

    // sort and filter matches above threshold
    var makeup = [];
    for (match of matches) {
        var [feature,related] = match;
        // sort
        related = sortSpatialRelations(related, 'within', 0);
        // keep any that are significant from the perspective of either boundary (>1% of area)
        var significantRelated = [];
        for (x of related) {
            if ((x[1].within >= 0.01) | (x[1].contains >= 0.01)) { // x[1] is the stats dict
                significantRelated.push(x)
            };
        };
        if (significantRelated.length > 0) {
            makeup.push([feature,significantRelated]);
        };
    };
    
    // populate tables
    // populate makeup table
    var table = document.getElementById('comparison-names-table')
    // clear old table rows if exists
    var tbody = document.getElementById('comparison-names-table-tbody');
    tbody.innerHTML = "";
    // if any related
    if (makeup.length) {
        // add rows
        for (x of makeup) {
            var [feature,related] = x;
            var row = document.createElement("tr");
            // name
            var cell = document.createElement("td");
            var name2 = feature.getProperties()[comparisonSelect.value];
            var ID2 = feature.getId();
            var getFeatureJs = 'comparisonLayer.getSource().getFeatureById('+ID2+')';
            var onclick = 'openFeatureComparePopup(null,'+getFeatureJs+')';
            cell.innerHTML = '<a style="cursor:pointer" onclick="'+onclick+'">'+name2+'</a>';
            row.appendChild(cell);
            // find related boundaries
            var cell = document.createElement("td");
            var cellContent = '';
            for (x of related) {
                [matchFeature,stats] = x;
                var ID = matchFeature.getId();
                var name = matchFeature.getProperties()['shapeName'];
                var getFeature1Js = 'gbLayer.getSource().getFeatureById('+ID+')';
                var getFeature2Js = 'comparisonLayer.getSource().getFeatureById('+ID2+')';
                var onclick = 'openFeatureComparePopup('+getFeature1Js+','+getFeature2Js+')';
                var nameLink = '<a style="cursor:pointer" onclick="'+onclick+'">'+name+'</a>';
                var share = (stats.within * 100).toFixed(1) + '%';
                cellContent += share + ' ' + nameLink + '<br>';
            };
            cell.innerHTML = cellContent;
            row.appendChild(cell);
            // add row
            tbody.appendChild(row);
        };
    };
};




//-----------------------------------
// this chunk initiates the main map

// layer definitions

var gbStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.4)',
    }),
    stroke: new ol.style.Stroke({
        color: 'rgb(29,107,191)', //'rgb(49, 127, 211)',
        width: 2.5,
    }),
});
var gbLayer = new ol.layer.Vector({
    style: gbStyle,
});

var comparisonStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0)', // fully transparent
    }),
    stroke: new ol.style.Stroke({
        color: 'rgba(255, 0, 0, 0.8)',
        width: 1.5,
        lineDash: [10,10]
    }),
});
var comparisonLayer = new ol.layer.Vector({
    style: comparisonStyle,
});

// map

var map = new ol.Map({
    target: 'map',
    controls: ol.control.defaults().extend([new ol.control.FullScreen(),
                                            new ol.control.ScaleLine({units: 'metric'}),
                                            ]),
    layers: [
    new ol.layer.Tile({
        source: new ol.source.XYZ({
            attributions: 'Satellite Imagery <a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ',
            url:
            'https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=' + 'aknzJQRnZg32XVVPrcYH',
            maxZoom: 20,
            crossOrigin: 'anonymous' // necessary for converting map to img during pdf generation: https://stackoverflow.com/questions/66671183/how-to-export-map-image-in-openlayer-6-without-cors-problems-tainted-canvas-iss
        })}),
        gbLayer,
        comparisonLayer
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([37.41, 8.82]),
        zoom: 4
    })
});

// map click popup
function openFeatureComparePopup(feat1, feat2) {
    // reset any previous names
    document.getElementById('feature-compare-left-name').innerText = '-';
    document.getElementById('feature-compare-right-name').innerText = '-';
    // get names
    let mainName = '-';
    let comparisonName = '-';
    var comparisonSelect = document.getElementById('comparison-names-table-select');
    if (feat1 != null) {
        mainName = feat1.getProperties()['shapeName'];
    };
    if (feat2 != null) {
        comparisonName = feat2.getProperties()[comparisonSelect.value];
    };
    // update the names
    document.getElementById('feature-compare-left-name').innerText = mainName;
    document.getElementById('feature-compare-right-name').innerText = comparisonName;
    // update drop buttons
    if (feat1 != null & feat2 != null) {
        // enable clear feat1
        var leftbut = document.getElementById('feature-compare-left-clear');
        leftbut.style.display = 'block';
        var onclick = function() {
            document.getElementById('close-compare-popup').click();
            openFeatureComparePopup(null,feat2);
        };
        leftbut.onclick = onclick;
        // enable clear feat2
        var rightbut = document.getElementById('feature-compare-right-clear');
        rightbut.style.display = 'block';
        var onclick = function() {
            document.getElementById('close-compare-popup').click();
            openFeatureComparePopup(feat1,null);
        };
        rightbut.onclick = onclick;
    } else {
        // hide both clear buttons
        var leftbut = document.getElementById('feature-compare-left-clear');
        leftbut.style.display = 'none';
        leftbut.onclick = null;
        var rightbut = document.getElementById('feature-compare-right-clear');
        rightbut.style.display = 'none';
        rightbut.onclick = null;
    };
    // calc spatial stats
    if (feat1 != null) {
        stats1 = calcSpatialStats([feat1]);
    };
    if (feat2 != null) {
        stats2 = calcSpatialStats([feat2]);
    };
    // update the spatial stats
    if (feat1 != null) {
        var lvl = document.getElementById('admin-level-select').value;
        document.getElementById('feature-compare-stats-gb-level').innerText = lvl;
        document.getElementById('feature-compare-stats-gb-area').innerText = stats1.area.toLocaleString('en-US', {maximumFractionDigits:0}) + ' km2';
        document.getElementById('feature-compare-stats-gb-circumf').innerText = stats1.circumf.toLocaleString('en-US', {maximumFractionDigits:0}) + ' km';
        document.getElementById('feature-compare-stats-gb-vertices').innerText = stats1.vertices.toLocaleString('en-US');
        document.getElementById('feature-compare-stats-gb-avglinedens').innerText = stats1.avgLineDensity.toFixed(1) + ' / km';
        document.getElementById('feature-compare-stats-gb-avglineres').innerText = stats1.avgLineResolution.toFixed(1) + ' m';
    } else {
        document.getElementById('feature-compare-stats-gb-level').innerText = '-';
        document.getElementById('feature-compare-stats-gb-area').innerText = '-';
        document.getElementById('feature-compare-stats-gb-circumf').innerText = '-';
        document.getElementById('feature-compare-stats-gb-vertices').innerText = '-';
        document.getElementById('feature-compare-stats-gb-avglinedens').innerText = '-';
        document.getElementById('feature-compare-stats-gb-avglineres').innerText = '-';
        document.getElementById('feature-compare-stats-gb-overlap').innerText = '-';
        document.getElementById('feature-compare-stats-gb-related').innerHTML = '-';
    };
    if (feat2 != null) {
        var lvl = document.getElementById('comparison-admin-level-select').value;
        document.getElementById('feature-compare-stats-comp-level').innerText = lvl;
        document.getElementById('feature-compare-stats-comp-area').innerText = stats2.area.toLocaleString('en-US', {maximumFractionDigits:0}) + ' km2';
        document.getElementById('feature-compare-stats-comp-circumf').innerText = stats2.circumf.toLocaleString('en-US', {maximumFractionDigits:0}) + ' km';
        document.getElementById('feature-compare-stats-comp-vertices').innerText = stats2.vertices.toLocaleString('en-US', {maximumFractionDigits:0});
        document.getElementById('feature-compare-stats-comp-avglinedens').innerText = stats2.avgLineDensity.toFixed(1) + ' / km';
        document.getElementById('feature-compare-stats-comp-avglineres').innerText = stats2.avgLineResolution.toFixed(1) + ' m';
    } else {
        document.getElementById('feature-compare-stats-comp-level').innerText = '-';
        document.getElementById('feature-compare-stats-comp-area').innerText = '-';
        document.getElementById('feature-compare-stats-comp-circumf').innerText = '-';
        document.getElementById('feature-compare-stats-comp-vertices').innerText = '-';
        document.getElementById('feature-compare-stats-comp-avglinedens').innerText = '-';
        document.getElementById('feature-compare-stats-comp-avglineres').innerText = '-';
        document.getElementById('feature-compare-stats-comp-overlap').innerText = '-';
        document.getElementById('feature-compare-stats-comp-related').innerHTML = '-';
    };
    // calc relations stats
    if (feat1 != null) {
        var features2 = comparisonLayer.getSource().getFeatures();
        related = calcSpatialRelations(feat1, features2);
        // sort
        related = sortSpatialRelations(related, 'within', 0);
        // keep any that are significant from the perspective of either boundary (>1% of area)
        var significantRelated1 = [];
        for (x of related) {
            if ((x[1].within >= 0.01) | (x[1].contains >= 0.01)) { // x[1] is the stats dict
                significantRelated1.push(x)
            };
        };
        // update the list of related boundaries
        var cellContent = '';
        var ID = feat1.getId();
        for (x of significantRelated1) {
            [matchFeature,stats] = x;
            var ID2 = matchFeature.getId();
            var name2 = matchFeature.getProperties()[comparisonSelect.value];
            var getFeature1Js = 'gbLayer.getSource().getFeatureById('+ID+')';
            var getFeature2Js = 'comparisonLayer.getSource().getFeatureById('+ID2+')';
            var onclick = "document.getElementById('close-compare-popup').click(); " + 'openFeatureComparePopup('+getFeature1Js+','+getFeature2Js+')';
            var nameLink = '<a style="cursor:pointer" onclick="'+onclick+'">'+name2+'</a>';
            var share = (stats.within * 100).toFixed(1) + '%';
            cellContent += share + ' ' + nameLink + '<br>';
        };
        document.getElementById('feature-compare-stats-gb-related').innerHTML = cellContent;
    };
    if (feat2 != null) {
        var features1 = gbLayer.getSource().getFeatures();
        related = calcSpatialRelations(feat2, features1);
        // sort
        related = sortSpatialRelations(related, 'within', 0);
        // keep any that are significant from the perspective of either boundary (>1% of area)
        var significantRelated2 = [];
        for (x of related) {
            if ((x[1].within >= 0.01) | (x[1].contains >= 0.01)) { // x[1] is the stats dict
                significantRelated2.push(x)
            };
        };
        // update the list of related boundaries
        var cellContent = '';
        var ID2 = feat2.getId();
        for (x of significantRelated2) {
            [matchFeature,stats] = x;
            var ID = matchFeature.getId();
            var name1 = matchFeature.getProperties()['shapeName'];
            var getFeature1Js = 'gbLayer.getSource().getFeatureById('+ID+')';
            var getFeature2Js = 'comparisonLayer.getSource().getFeatureById('+ID2+')';
            var onclick = "document.getElementById('close-compare-popup').click(); " + 'openFeatureComparePopup('+getFeature1Js+','+getFeature2Js+')';
            var nameLink = '<a style="cursor:pointer" onclick="'+onclick+'">'+name1+'</a>';
            var share = (stats.within * 100).toFixed(1) + '%';
            cellContent += share + ' ' + nameLink + '<br>';
        };
        document.getElementById('feature-compare-stats-comp-related').innerHTML = cellContent;
    };
    // prep for map
    var geojWriter = new ol.format.GeoJSON();
    if (feat1 != null) {
        var geoj1 = geojWriter.writeFeatureObject(feat1);
        var geojColl1 = {type:'FeatureCollection', features:[geoj1]};
    } else {
        var geojColl1 = {type:'FeatureCollection', features:[]};
        for (x of significantRelated2) {
            [matchFeature,stats] = x;
            var matchGeoj = geojWriter.writeFeatureObject(matchFeature);
            geojColl1.features.push(matchGeoj);
        };
    };
    if (feat2 != null) {
        var geoj2 = geojWriter.writeFeatureObject(feat2);
        var geojColl2 = {type:'FeatureCollection', features:[geoj2]};
    } else {
        var geojColl2 = {type:'FeatureCollection', features:[]};
        for (x of significantRelated1) {
            [matchFeature,stats] = x;
            var matchGeoj = geojWriter.writeFeatureObject(matchFeature);
            geojColl2.features.push(matchGeoj);
        };
    };
    // calc similarity stats
    var geojWriter = new ol.format.GeoJSON();
    var geoj1 = null;
    var geoj2 = null;
    if (feat1 != null) {
        geoj1 = geojWriter.writeFeatureObject(feat1);
    };
    if (feat2 != null) {
        geoj2 = geojWriter.writeFeatureObject(feat2);
    };
    if (feat1 != null & feat2 != null) {
        stats = similarity(geoj1, geoj2);
    };
    // update the stats entries
    if (feat1 != null & feat2 != null) {
        //document.getElementById('feature-compare-equality').innerText = (stats.equality*100).toFixed(1) + '%';
        //document.getElementById('feature-compare-contains').innerText = (stats.contains*100).toFixed(1) + '%';
        //document.getElementById('feature-compare-within').innerText = (stats.within*100).toFixed(1) + '%';
        document.getElementById('feature-compare-stats-gb-overlap').innerText = (stats.within*100).toFixed(1) + '%';
        document.getElementById('feature-compare-stats-comp-overlap').innerText = (stats.contains*100).toFixed(1) + '%';
        // figure out relationship
        if ((stats.within >= 0.99) & (stats.contains >= 0.99)) {
            var rel1 = 'EQUALS';
            var rel2 = 'EQUALS';
        } else if ((stats.within >= 0.99) | (stats.contains >= 0.99)) {
            // either is >99%
            if (stats.within > stats.contains) {
                var rel2 = 'CONTAINS ALL OF';
                var rel1 = 'FULLY INSIDE';
            } else {
                var rel1 = 'CONTAINS ALL OF';
                var rel2 = 'FULLY INSIDE';
            };
        } else if ((stats.within >= 0.666) | (stats.contains >= 0.666)) {
            // either is >66%
            if (stats.within > stats.contains) {
                var rel2 = 'CONTAINS MOST OF';
                var rel1 = 'MOSTLY INSIDE';
            } else {
                var rel1 = 'CONTAINS MOST OF';
                var rel2 = 'MOSTLY INSIDE';
            };
        } else {
            // both are 0-66%
            if (stats.within > stats.contains) {
                var rel2 = 'CONTAINS PARTS OF';
                var rel1 = 'PARTLY INSIDE';
            } else {
                var rel1 = 'CONTAINS PARTS OF';
                var rel2 = 'PARTLY INSIDE';
            };
        };
        document.getElementById('feature-compare-stats-gb-relation').innerText = rel1;
        document.getElementById('feature-compare-stats-comp-relation').innerText = rel2;
    };
    // show popup
    document.getElementById('feature-compare-popup').className = 'popup';
    featureCompareMap.updateSize(); // otherwise will remain hidden until window resize
    // scroll to the top
    document.getElementById('close-compare-popup').scrollIntoView(true);
    // add feats to the popup comparison map
    updateFeatureComparisonMap(geojColl1, geojColl2);
};

map.on('singleclick', function(evt) {
    // get feats
    let mainFeat = null;
    let comparisonFeat = null;
    map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
        if (layer === gbLayer) {
            mainFeat = feature
        } else if (layer === comparisonLayer) {
            comparisonFeat = feature
        };
    });
    // init and open popup for the found features
    if (mainFeat != null | comparisonFeat != null) {
        openFeatureComparePopup(mainFeat, comparisonFeat);
    };
});

updateGbCountries();



// --------------------------------
    // Adds the feature comparison map

    // define map background

    var tileLayer = new ol.layer.Tile({
            source: new ol.source.XYZ({
                attributions: 'Satellite Imagery <a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ',
                url:
                'https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=' + 'aknzJQRnZg32XVVPrcYH',
                maxZoom: 20,
                crossOrigin: 'anonymous' // necessary for converting map to img during pdf generation: https://stackoverflow.com/questions/66671183/how-to-export-map-image-in-openlayer-6-without-cors-problems-tainted-canvas-iss
    })});
    var layers = [tileLayer];

    // define main layer

    var style = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.4)',
        }),
        stroke: new ol.style.Stroke({
            color: 'rgb(29,107,191)', //'rgb(49, 127, 211)',
            width: 2.5,
        }),
    });
    var featureCompareMainLayer = new ol.layer.Vector({
        style: style,
    });
    layers.push(featureCompareMainLayer);

    // define comparison layer
    
    var style = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0)', // fully transparent
        }),
        stroke: new ol.style.Stroke({
            color: 'rgba(255, 0, 0, 0.8)',
            width: 1.5,
            lineDash: [10,10]
        }),
    });
    var featureCompareComparisonLayer = new ol.layer.Vector({
        style: style,
    });
    layers.push(featureCompareComparisonLayer);

    // create the map			
    
    var featureCompareMap = new ol.Map({
        target: 'feature-compare-map',
        controls: ol.control.defaults().extend([new ol.control.FullScreen(),
                                            new ol.control.ScaleLine({units: 'metric'}),
                                            ]),
        layers: layers,
        view: new ol.View({
            center: ol.proj.fromLonLat([37.41, 8.82]),
            zoom: 4
        })
    });

    // populating the featureCompareMap

    function updateFeatureComparisonMap(mainGeoj, comparisonGeoj) {
        // set main source
        if (mainGeoj != null) {
            var source = new ol.source.Vector({
                features: new ol.format.GeoJSON().readFeatures(mainGeoj,
                                                                {} // featureProjection: featureCompareMap.getView().getProjection() }
                ),
            });
            featureCompareMainLayer.setSource(source);
        };

        // set comparison source
        if (comparisonGeoj != null) {
            var source = new ol.source.Vector({
                features: new ol.format.GeoJSON().readFeatures(comparisonGeoj,
                                                                {} // featureProjection: featureCompareMap.getView().getProjection() }
                ),
            });
            featureCompareComparisonLayer.setSource(source);
        };

        // zoom to combined extents
        var extent = ol.extent.createEmpty();
        if (mainGeoj != null) {
            extent = ol.extent.extend(extent, featureCompareMainLayer.getSource().getExtent());
        };
        if (comparisonGeoj != null) {
            extent = ol.extent.extend(extent, featureCompareComparisonLayer.getSource().getExtent());
        };
        featureCompareMap.getView().fit(extent);

        // zoom out a little
        featureCompareMap.getView().setZoom(featureCompareMap.getView().getZoom()-1);
    };
