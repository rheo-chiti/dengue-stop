import React, { Component } from 'react';
import { Text, View, StyleSheet, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FlatList } from 'react-native-gesture-handler';
import moment from 'moment';
import firebase from 'firebase'
import '@firebase/firestore';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

posts = []

export default class currentRegionPosts extends Component {
    state = {
        posts: [],
        Location: null
    }

    constructor(props) {
        super(props);
        if (Platform.OS === 'android' && !Constants.isDevice) {
            this.setState({
                errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
            });
        } else {
            this._getLocationAsync();
        }
    }

    _getLocationAsync = async () => {
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status !== 'granted') {
            this.setState({
                errorMessage: 'Permission to access location was denied',
            });
        }

        let location = await Location.getCurrentPositionAsync({});
        this.setState({ location });
    };

    componentDidMount() {
        posts = []

        const userLatitude = this.state.location.coords.latitude
        const userLongitude = this.state.location.coords.longitude

        const ref = firebase.firestore().collection('posts')
        let allPosts = ref.get().then(snapshot => {
            snapshot.forEach(doc => {
                if (calcCrow(userLatitude, userLongitude, doc.data().latitude, doc.data().longitude) <= 100) {
                    posts.push(doc.data())
                }
            })
            this.setState({ posts: posts })
        })
    }
    renderPost = post => {
        return (
            <View style={styles.feedItem}>
                <ImageBackground source={{ uri: post.avatar }} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                            <Text style={styles.name}>{post.name}</Text>
                            <Text style={styles.timestamp}>{moment(post.timestamp).fromNow()}</Text>
                        </View>
                        <Ionicons name='ios-more' size={24} color='#73788B' />
                    </View>
                    <Text style={styles.posts}>{post.text}</Text>
                    <ImageBackground source={{ uri: post.image }} style={styles.postImage} resizeMode="cover" />
                    <View style={{ flexDirection: 'row' }}>
                        <Ionicons name='ios-heart-empty' size={24} color='#73788B' style={{ marginRight: 16 }} />
                        <Ionicons name='ios-chatboxes' size={24} color='#73788B' />
                    </View>
                </View>
            </View>
        )
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Feed</Text>
                </View>
                <FlatList
                    style={styles.feed}
                    data={this.state.posts}
                    renderItem={({ item }) => this.renderPost(item)}
                    keyExtractor={item => item.timestamp.toString()}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        )
    }
}

//This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
function calcCrow(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}

// Converts numeric degrees to radians
function toRad(Value) {
    return Value * Math.PI / 180;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EFECF4'
    },
    header: {
        paddingTop: 48,
        paddingBottom: 16,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#EBECF4',
        shadowColor: '#454D65',
        shadowOffset: { height: 5 },
        shadowRadius: 15,
        shadowOpacity: 0.2,
        zIndex: 10
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "500",
    },
    feed: {
        marginHorizontal: 16,
    },
    feedItem: {
        backgroundColor: "#FFF",
        borderRadius: 5,
        padding: 8,
        flexDirection: "row",
        marginVertical: 8,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 16,
    },
    name: {
        fontSize: 15,
        fontWeight: "500",
        color: '#454D65',
    },
    timestamp: {
        fontSize: 11,
        color: '#C4C6CE',
        marginTop: 4
    },
    posts: {
        marginTop: 16,
        fontSize: 14,
        color: '#838899'
    },
    postImage: {
        width: undefined,
        height: 150,
        borderRadius: 5,
        marginVertical: 16,

    }
}) 