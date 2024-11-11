export interface TripInterface {
    driver: {
        uid: string;
        firstName: string;
        lastName: string;
        rut: string;
        email: string;
        phone: number;
    };
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
    passengers: any[];
    status: 'published' | 'started' | 'completed';
}
