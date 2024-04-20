const utilsFunction = {
    getJsonDate(dateUnparsed, removeZero) {
        let res = {
            year: undefined,
            month: undefined,
            monthText: undefined,
            day: undefined,
            hours: undefined,
            minutes: undefined,
            seconds: undefined,

        }
        res.year = removeZero ? String(Number(dateUnparsed.substring(0,4))) : dateUnparsed.substring(0,4)
        res.month = removeZero ? String(Number(dateUnparsed.substring(5,7))) : dateUnparsed.substring(5,7)
        res.day = removeZero ? String(Number(dateUnparsed.substring(8,10))) : dateUnparsed.substring(8,10)
        res.hours = removeZero ? String(Number(dateUnparsed.substring(11,13))) : dateUnparsed.substring(11,13)
        res.minutes = removeZero ? String(Number(dateUnparsed.substring(14,16))) : dateUnparsed.substring(14,16)
        res.seconds = removeZero ? String(Number(dateUnparsed.substring(17,19))) : dateUnparsed.substring(17,19)
        if(Number(res.month) === 1) {
            res.monthText = 'January'
        } else if(Number(res.month) === 2) {
            res.monthText = 'February'
        } else if(Number(res.month) === 3) {
            res.monthText = 'March'
        } else if(Number(res.month) === 4) {
            res.monthText = 'April'
        } else if(Number(res.month) === 5) {
            res.monthText = 'May'
        } else if(Number(res.month) === 6) {
            res.monthText = 'June'
        } else if(Number(res.month) === 7) {
            res.monthText = 'July'
        } else if(Number(res.month) === 8) {
            res.monthText = 'August'
        } else if(Number(res.month) === 9) {
            res.monthText = 'September'
        } else if(Number(res.month) === 10) {
            res.monthText = 'October'
        } else if(Number(res.month) === 11) {
            res.monthText = 'November'
        } else if(Number(res.month) === 12) {
            res.monthText = 'Dicember'
        }
        return res
    },

    getBeautyCoordinates(coordinates) {
        console.log('coordinates: ', coordinates)
        let result = {
            coordinates: coordinates,
            beautyCoordinates: [],
            beautyCoordinatesTextTime: undefined,
            beautyCoordinatesTextDecimal: undefined,
            latDeg: undefined,
            latMin: undefined,
            latSec: undefined,
            longDeg: undefined,
            longMin: undefined,
            longSec: undefined,
        }
        let latCoord = coordinates[0]
        let longCoord = coordinates[1]
        let tempLat = Math.floor(latCoord * 100)
        let tempLong = Math.floor(longCoord * 100)

        result.latDeg = (latCoord > 0) ? Math.abs(Math.floor(latCoord)) : Math.abs(Math.ceil(latCoord))
        result.longDeg = (latCoord > 0) ? Math.abs(Math.floor(longCoord)) : Math.abs(Math.ceil(longCoord))

        let latPolarDirection = result.latDeg + (latCoord > 0) ? 'N' : 'S'
        let longPolarDirection = result.longDeg + (longCoord > 0) ? 'E' : 'W'

        let tempLatSec = (Math.abs((tempLat) - (result.latDeg * 100))) * 36
        let tempLongSec = (Math.abs((tempLong) - (result.longDeg * 100))) * 36

        console.log('tempLong:', tempLong)
        console.log('tempLatSec:', tempLongSec)
        console.log('longCoord:', longCoord)
        console.log('(tempLong) - (result.longDeg * 100):', (tempLong) - (result.longDeg * 100))
        
        result.latSec = Math.floor(tempLatSec % 60)
        result.longSec = Math.floor(tempLongSec % 60)
        console.log('result.longSec:', result.longSec)

        result.latMin = Math.floor((tempLatSec - result.latSec) / 60)
        result.longMin = Math.floor((tempLongSec - result.longSec) / 60)

        result.beautyCoordinates.push(result.latDeg + '°' + result.latMin + '\'\'' + latPolarDirection)
        // result.beautyCoordinates.push(result.latDeg + '°' + result.latMin + '\'' + result.latSec + '\'\'' + latPolarDirection)
        result.beautyCoordinates.push(result.longDeg + '°' + result.longMin + '\'\'' + longPolarDirection)
        // result.beautyCoordinates.push(result.longDeg + '°' + result.longMin + '\'' + result.longSec + '\'\'' + longPolarDirection)
        
        result.beautyCoordinatesTextTime = result.beautyCoordinates[0] + ' | ' + result.beautyCoordinates[1]
        result.beautyCoordinatesTextDecimal = Math.abs(result.coordinates[0]).toFixed(5) + '°' + latPolarDirection + ' | ' + Math.abs(result.coordinates[1]).toFixed(5) + '°' + longPolarDirection

        console.log(result)

        return result
    },

    getBeautyDate(dateUnparsed) {
        let parsedDate = this.getJsonDate(dateUnparsed, true)
        return parsedDate.monthText + ' ' + parsedDate.day
    },

    getBeautyDatetime(dateUnparsed) {
        let parsedDateZero = this.getJsonDate(dateUnparsed, false)
        let parsedDate = this.getJsonDate(dateUnparsed, true)
        return parsedDate.monthText + ' ' + parsedDate.day + ', ' + parsedDateZero.hours + ':' + parsedDateZero.minutes
    },

    getJsonDuration(durationInSec) {
        let parsedDuration = {
            hours: undefined,
            minutes: undefined,
            seconds: undefined,
        }
        parsedDuration.hours = Math.floor(durationInSec / 3600)
        parsedDuration.minutes = Math.floor((durationInSec - (parsedDuration.hours * 3600)) / 60)
        parsedDuration.seconds = durationInSec - (parsedDuration.hours * 3600) - (parsedDuration.minutes * 60)
        return parsedDuration
    },

    getBeautyDuration(durationInSec) {
        let parsedDuration = this.getJsonDuration(durationInSec)
        return parsedDuration.hours + 'h ' + parsedDuration.minutes + 'm'
        // return parsedDuration.hours + 'h ' + parsedDuration.minutes + 'm ' + parsedDuration.seconds + 's'
    },

    labelize(value) {
        return value.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toLowerCase() }).trim()
    },

    polylineDecode(str, precision) {
        let index = 0
        let lat = 0
        let lng = 0
        let coordinates = []
        let shift = 0
        let result = 0
        let byte = null
        let latitude_change
        let longitude_change
        let factor = Math.pow(10, precision || 5)
        
        // Coordinates have variable length when encoded, so just keep
        // track of whether we've hit the end of the string. In each
        // loop iteration, a single coordinate is decoded.
        while (index < str.length) {
            // Reset shift, result, and byte
            byte = null;
            shift = 0;
            result = 0;
            do {
                byte = str.charCodeAt(index++) - 63;
                result |= (byte & 0x1f) << shift;
                shift += 5;
            } while (byte >= 0x20);
        
            latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
        
            shift = result = 0;
        
            do {
                byte = str.charCodeAt(index++) - 63;
                result |= (byte & 0x1f) << shift;
                shift += 5;
            } while (byte >= 0x20);
        
            longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
        
            lat += latitude_change;
            lng += longitude_change;
        
            coordinates.push([lat / factor, lng / factor]);
        }
        return coordinates;
    },
      
    flipped(coords) {
        let flipped = [];
        for (var i = 0; i < coords.length; i++) {
            flipped.push(coords[i].slice().reverse());
        }
        return flipped;
    },

    polylineToGeoJSON(str, precision) {
        let coords = this.polylineDecode(str, precision);
        return this.flipped(coords)
    },

    removeEmoji(text) {
        return text.replaceAll('[^\\p{L}\\p{M}\\p{N}\\p{P}\\p{Z}\\p{Cf}\\p{Cs}\\s]','')
    },

    getAverageSpeedMetric(distance, duration) {
        return Number(((distance / duration) * 3.6).toFixed(0))
    },

    getAverageSpeedImperial(distance, duration) {
        return Number((((distance / duration) * 3.6) * 0.621371).toFixed(0))
    }
}

export default utilsFunction