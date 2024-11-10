export interface TripInterface {
    driver: any;
    vehicle: any;
    origin: {
        name: string,
        coords: {
            lat: number;
            lng: number;
        };
    };
    destination: {
        name: string,
        coords: {
            lat: number;
            lng: number;
        };
    };
    distance: string;
    duration: string;
    price: number;
    status: 'published' | 'started' | 'completed';
}
