export interface AnalyticsData {
    profileViews: {
      total: number;
      unique: number;
    };
    productViews: {
        total: number;
        unique: number;
    };
    totalListings: number;
    soldAds: number;
    userImpressions: number;
    topProducts: TopProduct[];
    viewsByDay: ViewByDay[];
    timeRange: number;
}

export interface TopProduct {
    _id: string;
    impressions: number;
    uniqueImpressions: number;
    adType: string;
    title: string;
    image: string | null;
    carAd: any;
    detailAd: any;
}

export interface ViewByDay {
    _id: string;
    productViews: number;
    profileViews: number;
    impressions: number;
}