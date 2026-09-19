import { useRef, useEffect, useState } from 'react'
import Globe from 'react-globe.gl'
import * as THREE from 'three'
import { feature } from 'topojson-client'
import { geoCentroid } from 'd3-geo'

const lighthouses = [
  { name: 'Tower of Hercules', lat: 43.3853, lng: -8.4066, kind: 'lighthouse', country: 'Spain', note: "The world's oldest operating lighthouse, in continuous use since the 1st century AD." },
  { name: 'Portland Head Light', lat: 43.6231, lng: -70.2083, kind: 'lighthouse', country: 'USA', note: "Maine's oldest lighthouse, lit in 1791." },
  { name: 'Lighthouse of Chania', lat: 35.5138, lng: 24.0203, kind: 'lighthouse', country: 'Greece', note: 'Venetian-Egyptian lighthouse marking the old port of Chania, Crete.' },
  { name: 'Fanad Lighthouse', lat: 55.2764, lng: -7.6378, kind: 'lighthouse', country: 'Ireland', note: 'Marks the entrance to Lough Swilly.' },
  { name: 'Les Eclaireurs Lighthouse', lat: -54.8730, lng: -67.6800, kind: 'lighthouse', country: 'Argentina', note: 'The "Lighthouse at the End of the World" on the Beagle Channel.' },
  { name: "Peggy's Cove Lighthouse", lat: 44.4918, lng: -63.9155, kind: 'lighthouse', country: 'Canada', note: 'One of the most photographed lighthouses in the world.' },
  { name: 'Lindau Lighthouse', lat: 47.5460, lng: 9.6840, kind: 'lighthouse', country: 'Germany', note: 'Marks the harbor entrance on Lake Constance.' },
  { name: 'Tourlitis Lighthouse', lat: 37.6350, lng: 24.9500, kind: 'lighthouse', country: 'Greece', note: 'Built on a small rock islet off Andros.' },
  { name: 'Pigeon Point Lighthouse', lat: 37.1789, lng: -122.3944, kind: 'lighthouse', country: 'USA', note: 'One of the tallest lighthouses on the US Pacific coast.' },
  { name: 'Cape Hatteras Lighthouse', lat: 35.2508, lng: -75.5292, kind: 'lighthouse', country: 'USA', note: 'Tallest brick lighthouse in North America.' },
  { name: 'Heceta Head Light', lat: 44.1377, lng: -124.1276, kind: 'lighthouse', country: 'USA', note: 'Historic Oregon coast lighthouse.' },
  { name: 'Formentor Lighthouse', lat: 39.9583, lng: 3.2075, kind: 'lighthouse', country: 'Spain', note: 'Marks the northern tip of Majorca.' },
  { name: 'Lindesnes Lighthouse', lat: 57.9838, lng: 7.0453, kind: 'lighthouse', country: 'Norway', note: "Norway's oldest lighthouse, at the country's southernmost point." },
  { name: 'Split Rock Lighthouse', lat: 47.2001, lng: -91.3675, kind: 'lighthouse', country: 'USA', note: 'Iconic Lake Superior lighthouse in Minnesota.' },
  { name: 'Cape Byron Light', lat: -28.6382, lng: 153.6382, kind: 'lighthouse', country: 'Australia', note: 'Marks the easternmost point of mainland Australia.' },
  { name: 'Diamond Head Lighthouse', lat: 21.2559, lng: -157.8064, kind: 'lighthouse', country: 'USA', note: 'Guards the approach to Honolulu, Oahu.' },
  { name: 'Kõpu Lighthouse', lat: 58.9167, lng: 22.1000, kind: 'lighthouse', country: 'Estonia', note: 'One of the oldest lighthouses in continuous operation, on Hiiumaa.' },
  { name: 'Eldred Rock Light', lat: 58.9833, lng: -135.2167, kind: 'lighthouse', country: 'USA', note: 'Historic Alaskan lighthouse in the Lynn Canal.' },
  { name: 'Hook Lighthouse', lat: 52.1242, lng: -6.9297, kind: 'lighthouse', country: 'Ireland', note: 'One of the oldest operating lighthouses in the world, dating to the 13th century.' },
  { name: 'Fastnet Rock Lighthouse', lat: 51.3856, lng: -9.6033, kind: 'lighthouse', country: 'Ireland', note: "Known as 'Ireland's Teardrop', the country's southernmost point." },
  { name: "Maiden's Tower Lighthouse", lat: 41.0211, lng: 29.0044, kind: 'lighthouse', country: 'Turkey', note: 'Iconic islet lighthouse in the Bosphorus, Istanbul.' },
  { name: 'Bodie Island Lighthouse', lat: 35.8228, lng: -75.5647, kind: 'lighthouse', country: 'USA', note: 'Marks the Outer Banks of North Carolina.' },
  { name: 'Felgueiras Lighthouse', lat: 41.1500, lng: -8.6700, kind: 'lighthouse', country: 'Portugal', note: 'Guards the mouth of the Douro River at Porto.' },
  { name: 'Bell Rock Lighthouse', lat: 56.4331, lng: -2.3831, kind: 'lighthouse', country: 'UK', note: "The world's oldest surviving offshore rock lighthouse." },
  { name: 'South Stack Lighthouse', lat: 53.3086, lng: -4.6967, kind: 'lighthouse', country: 'UK', note: 'Built on a small island off Anglesey, Wales.' },
  { name: 'Jeddah Light', lat: 21.4858, lng: 39.1500, kind: 'lighthouse', country: 'Saudi Arabia', note: "The world's tallest lighthouse, per Guinness World Records." },
  { name: 'Low Lighthouse', lat: 51.2378, lng: -3.0044, kind: 'lighthouse', country: 'UK', note: 'Historic lighthouse on the Somerset coast at Burnham-on-Sea.' },
  { name: "Makapu'u Point Light", lat: 21.3106, lng: -157.6494, kind: 'lighthouse', country: 'USA', note: 'Guards the eastern point of Oahu, Hawaii.' },
  { name: 'Cape Point Lighthouse', lat: -34.3568, lng: 18.4970, kind: 'lighthouse', country: 'South Africa', note: 'Guards the approach near the Cape of Good Hope.' },
  { name: 'Mouro Island Lighthouse', lat: 43.4644, lng: -3.7728, kind: 'lighthouse', country: 'Spain', note: "Marks the entrance to Santander's bay." },
  { name: 'Point Bonita Lighthouse', lat: 37.8158, lng: -122.5328, kind: 'lighthouse', country: 'USA', note: 'Guards the northern entrance to San Francisco Bay.' },
  { name: 'St. Joseph Lighthouse', lat: 42.1119, lng: -86.4956, kind: 'lighthouse', country: 'USA', note: 'Marks the harbor at St. Joseph, Michigan, on Lake Michigan.' },
  { name: 'Cape Reinga Lighthouse', lat: -34.4269, lng: 172.6817, kind: 'lighthouse', country: 'New Zealand', note: 'Marks the meeting of the Tasman Sea and Pacific Ocean.' },
  { name: 'Sambro Island Light', lat: 44.4611, lng: -63.5975, kind: 'lighthouse', country: 'Canada', note: 'Oldest surviving lighthouse in the Americas.' },
  { name: 'Rubjerg Knude Lighthouse', lat: 57.4489, lng: 9.7856, kind: 'lighthouse', country: 'Denmark', note: 'Decommissioned lighthouse being slowly buried by shifting sand dunes.' },
  { name: 'Gay Head Light', lat: 41.3489, lng: -70.8347, kind: 'lighthouse', country: 'USA', note: 'Historic lighthouse on Marthas Vineyard, Massachusetts.' },
  { name: "Créac'h Lighthouse", lat: 48.4578, lng: -5.1247, kind: 'lighthouse', country: 'France', note: 'One of the most powerful lighthouses in the world, on Ushant.' },
  { name: 'Start Point Lighthouse', lat: 50.2211, lng: -3.6386, kind: 'lighthouse', country: 'UK', note: 'Marks a key headland on the Devon coast.' },
  { name: 'Whiteford Lighthouse', lat: 51.5883, lng: -4.2453, kind: 'lighthouse', country: 'UK', note: 'Only remaining cast-iron wave-swept lighthouse in Britain.' },
  { name: 'Point Vicente Lighthouse', lat: 33.7444, lng: -118.4128, kind: 'lighthouse', country: 'USA', note: 'Guards the Palos Verdes Peninsula, California.' },
  { name: 'Rockland Harbor Breakwater Light', lat: 44.1114, lng: -69.0783, kind: 'lighthouse', country: 'USA', note: "Marks Rockland Harbor at the end of a nearly mile-long breakwater." },
  { name: 'Beachy Head Lighthouse', lat: 50.7386, lng: 0.2447, kind: 'lighthouse', country: 'UK', note: 'Marks the chalk headland of Beachy Head, East Sussex.' },
  { name: 'Hog (Paradise) Island Lighthouse', lat: 25.0850, lng: -77.3050, kind: 'lighthouse', country: 'Bahamas', note: 'Guards the approach to Nassau harbor.' },
  { name: 'Pemaquid Point Light', lat: 43.8372, lng: -69.5058, kind: 'lighthouse', country: 'USA', note: 'Iconic Maine lighthouse on a rocky point.' },
  { name: 'St. Augustine Light', lat: 29.8850, lng: -81.2878, kind: 'lighthouse', country: 'USA', note: "Marks Florida's oldest port city, Anastasia Island." },
  { name: "St. Mary's Lighthouse", lat: 55.0722, lng: -1.4472, kind: 'lighthouse', country: 'UK', note: 'Built on a tidal island near Whitley Bay, England.' },
  { name: 'Neist Point Lighthouse', lat: 57.4256, lng: -6.7883, kind: 'lighthouse', country: 'UK', note: 'Marks the westernmost point of Skye, Scotland.' },
  { name: "La Corbière Lighthouse", lat: 49.1867, lng: -2.2306, kind: 'lighthouse', country: 'Jersey', note: 'Iconic lighthouse on a tidal rock off Jersey.' },
  { name: 'Kjeungskjær Lighthouse', lat: 63.7594, lng: 9.9944, kind: 'lighthouse', country: 'Norway', note: 'Guards the Trondheim fjord approach.' },
  { name: 'Lighthouse of Genoa', lat: 44.4105, lng: 8.9114, kind: 'lighthouse', country: 'Italy', note: 'One of the tallest historic lighthouses in the world.' },
  { name: 'Cape Neddick Light', lat: 43.1656, lng: -70.5928, kind: 'lighthouse', country: 'USA', note: 'Also known as "Nubble Light", a popular Maine landmark.' },
  { name: 'Galle Lighthouse', lat: 6.0261, lng: 80.2172, kind: 'lighthouse', country: 'Sri Lanka', note: "Sri Lanka's oldest light station, within Galle Fort." },
  { name: 'Middle Bay Light', lat: 30.3958, lng: -88.0192, kind: 'lighthouse', country: 'USA', note: 'Historic hexagonal screwpile lighthouse in Mobile Bay, Alabama.' },
  { name: 'Slettnes Lighthouse', lat: 71.0972, lng: 28.2158, kind: 'lighthouse', country: 'Norway', note: "The world's northernmost mainland lighthouse." },
  { name: 'Hornby Lighthouse', lat: -33.8306, lng: 151.2789, kind: 'lighthouse', country: 'Australia', note: "Guards the entrance to Sydney Harbour at South Head." },
  { name: 'Yaquina Head Light', lat: 44.6799, lng: -124.0794, kind: 'lighthouse', country: 'USA', note: 'Tallest lighthouse in Oregon.' },
  { name: 'Enoshima Sea Candle', lat: 35.2997, lng: 139.4800, kind: 'lighthouse', country: 'Japan', note: 'Modern lighthouse-observatory tower on Enoshima Island.' },
  { name: 'Vizhinjam Lighthouse', lat: 8.3789, lng: 76.9711, kind: 'lighthouse', country: 'India', note: 'Marks the fishing harbor near Kovalam, Kerala.' },
  { name: 'Nugget Point Lighthouse', lat: -46.4467, lng: 169.8189, kind: 'lighthouse', country: 'New Zealand', note: "One of Otago's most iconic and oldest lighthouses." },
  { name: 'Cape Leeuwin Lighthouse', lat: -34.3739, lng: 115.1358, kind: 'lighthouse', country: 'Australia', note: 'Marks the point where the Indian and Southern Oceans meet.' },
  { name: 'Eastern Point Light', lat: 42.5772, lng: -70.6636, kind: 'lighthouse', country: 'USA', note: 'Guards the entrance to Gloucester Harbor, Massachusetts.' },
  { name: 'Green Point Lighthouse', lat: -33.9033, lng: 18.4008, kind: 'lighthouse', country: 'South Africa', note: "One of South Africa's oldest lighthouses, in Cape Town." },
  { name: 'Koh Lanta Lighthouse', lat: 7.5000, lng: 99.0500, kind: 'lighthouse', country: 'Thailand', note: 'Marks the southern tip of Koh Lanta island.' },
  { name: 'Kołobrzeg Lighthouse', lat: 54.1811, lng: 15.5622, kind: 'lighthouse', country: 'Poland', note: 'Historic Baltic Sea lighthouse rebuilt after WWII.' },
  { name: 'Los Morrillos Lighthouse', lat: 17.9333, lng: -67.1936, kind: 'lighthouse', country: 'Puerto Rico', note: 'Marks Cabo Rojo, on limestone cliffs above the Caribbean.' },
  { name: 'Nazaré Lighthouse', lat: 39.6011, lng: -9.0808, kind: 'lighthouse', country: 'Portugal', note: 'Overlooks Nazaré, famed for its giant surfing waves.' },
  { name: 'Yokohama Marine Tower', lat: 35.4425, lng: 139.6503, kind: 'lighthouse', country: 'Japan', note: 'One of the tallest lighthouse structures in the world.' },
  { name: 'Cape Espichel Lighthouse', lat: 38.4167, lng: -9.2167, kind: 'lighthouse', country: 'Portugal', note: 'Marks a dramatic cliff-top headland near Sesimbra.' },
  { name: 'Kermorvan Lighthouse', lat: 48.3600, lng: -4.7900, kind: 'lighthouse', country: 'France', note: 'Guards the approach to Le Conquet, Brittany.' },
  { name: 'Gibbs Hill Lighthouse', lat: 32.2489, lng: -64.8383, kind: 'lighthouse', country: 'Bermuda', note: 'One of the oldest cast-iron lighthouses in the world.' },
  { name: 'Cape Palliser Lighthouse', lat: -41.6108, lng: 175.2839, kind: 'lighthouse', country: 'New Zealand', note: "New Zealand's tallest lighthouse, on the Wairarapa coast." },
  { name: 'Big Sable Point Light', lat: 44.0561, lng: -86.5122, kind: 'lighthouse', country: 'USA', note: 'Marks Lake Michigan near Ludington.' },
  { name: 'Jose Ignacio Lighthouse', lat: -34.8386, lng: -54.6667, kind: 'lighthouse', country: 'Uruguay', note: 'Landmark lighthouse in the coastal village of José Ignacio.' },
  { name: 'Punta Penna Lighthouse', lat: 42.1611, lng: 14.7508, kind: 'lighthouse', country: 'Italy', note: "One of Italy's tallest lighthouses, near Vasto." },
  { name: 'Cape Agulhas Lighthouse', lat: -34.8286, lng: 20.0122, kind: 'lighthouse', country: 'South Africa', note: 'Marks the southernmost tip of Africa.' },
  { name: 'Fingal Head Light', lat: -28.2064, lng: 153.5647, kind: 'lighthouse', country: 'Australia', note: 'Small historic lighthouse on the New South Wales coast.' },
  { name: 'Fox Point Lighthouse', lat: 51.3717, lng: -55.5808, kind: 'lighthouse', country: 'Canada', note: 'Marks the approach to St. Anthony, Newfoundland.' },
  { name: 'Hillsboro Inlet Light', lat: 26.2589, lng: -80.0806, kind: 'lighthouse', country: 'USA', note: 'Marks the inlet at Hillsboro Beach, Florida.' },
  { name: 'La Jument Lighthouse', lat: 48.2489, lng: -5.1319, kind: 'lighthouse', country: 'France', note: 'Guards the treacherous Iroise Sea off Brittany.' },
  { name: 'Portland Bill Lighthouse', lat: 50.5164, lng: -2.4581, kind: 'lighthouse', country: 'UK', note: "Marks the southern tip of Dorset's Isle of Portland." },
  { name: 'Sumiyoshi Lighthouse', lat: 34.6136, lng: 135.4939, kind: 'lighthouse', country: 'Japan', note: 'Historic coastal lighthouse in Japan.' },
  { name: 'Punta del Hidalgo Lighthouse', lat: 28.5672, lng: -16.3236, kind: 'lighthouse', country: 'Spain', note: 'Marks a volcanic headland on Tenerife.' },
  { name: 'Point Reyes Lighthouse', lat: 37.9950, lng: -123.0181, kind: 'lighthouse', country: 'USA', note: 'One of the windiest and foggiest lighthouse sites in the US.' },
  { name: 'Alcatraz Island Lighthouse', lat: 37.8267, lng: -122.4230, kind: 'lighthouse', country: 'USA', note: 'First lighthouse on the US West Coast, on Alcatraz Island.' },
  { name: 'Cape Horn Lighthouse', lat: -55.9789, lng: -67.2919, kind: 'lighthouse', country: 'Chile', note: 'Marks the southernmost tip of South America.' },
  { name: 'San Juan del Salvamento Lighthouse', lat: -54.7397, lng: -63.8067, kind: 'lighthouse', country: 'Argentina', note: 'Historic lighthouse on Isla de los Estados, Tierra del Fuego.' },
  { name: 'Tillamook Rock Light', lat: 45.9375, lng: -124.0161, kind: 'lighthouse', country: 'USA', note: "Built on a rock exposed to some of the Pacific's fiercest storms." },
  { name: 'Tranøy Lighthouse', lat: 68.4394, lng: 15.9497, kind: 'lighthouse', country: 'Norway', note: 'Marks the Arctic coast of northern Norway.' },
  { name: 'Al Ayjah Lighthouse', lat: 22.5667, lng: 59.5333, kind: 'lighthouse', country: 'Oman', note: 'Guards the historic dhow-building town of Sur.' },
  { name: 'Amédée Lighthouse', lat: -22.4839, lng: 166.4728, kind: 'lighthouse', country: 'New Caledonia', note: 'Historic iron lighthouse guarding the approach to Nouméa.' },
  { name: 'Baishamen Lighthouse', lat: 20.0500, lng: 110.3833, kind: 'lighthouse', country: 'China', note: 'Marks a popular beach area on Hainan Island.' },
  { name: 'Ribadeo Lighthouse', lat: 43.5611, lng: -7.0322, kind: 'lighthouse', country: 'Spain', note: 'Marks the estuary at Ribadeo, on Isla Pancha.' },
  { name: 'Knarrarós Lighthouse', lat: 63.8631, lng: -21.1150, kind: 'lighthouse', country: 'Iceland', note: "One of Iceland's earliest reinforced-concrete lighthouses." },
  { name: 'Kullen Lighthouse', lat: 56.3011, lng: 12.4553, kind: 'lighthouse', country: 'Sweden', note: 'Marks the Kullaberg peninsula on the Kattegat strait.' },
  { name: 'South Haven Light', lat: 42.4028, lng: -86.2833, kind: 'lighthouse', country: 'USA', note: 'Marks the harbor entrance at South Haven, Michigan.' },
  { name: 'White Shoal Light', lat: 45.8394, lng: -85.1417, kind: 'lighthouse', country: 'USA', note: 'Distinctive red-and-white candy-striped lighthouse in Lake Michigan.' },
  { name: 'Cikoneng Lighthouse', lat: -6.8447, lng: 105.2011, kind: 'lighthouse', country: 'Indonesia', note: 'Marks the Sunda Strait coast of Banten, Java.' },
  { name: 'Farallon Island Light', lat: 37.6975, lng: -123.0011, kind: 'lighthouse', country: 'USA', note: 'Remote lighthouse on the Farallon Islands off San Francisco.' },
  { name: 'Holland Harbor Light', lat: 42.7742, lng: -86.2144, kind: 'lighthouse', country: 'USA', note: "Also known as 'Big Red', a landmark on Lake Michigan." },
  { name: 'Izumo Hinomisaki Lighthouse', lat: 35.4381, lng: 132.6167, kind: 'lighthouse', country: 'Japan', note: "One of Japan's tallest stone lighthouses, on Honshu." },
  { name: 'Kiipsaare Lighthouse', lat: 58.5333, lng: 21.8333, kind: 'lighthouse', country: 'Estonia', note: "A tilted, partly submerged lighthouse on Saaremaa's coast." },
  { name: 'Point Sur Lighthouse', lat: 36.3081, lng: -121.9042, kind: 'lighthouse', country: 'USA', note: 'Marks a dramatic volcanic rock on the Big Sur coastline.' },
  { name: 'Promthep Cape Lighthouse', lat: 7.7644, lng: 98.3033, kind: 'lighthouse', country: 'Thailand', note: "Marks Phuket's southernmost cape." },
  { name: 'Cape Spear Lighthouse', lat: 47.5225, lng: -52.6197, kind: 'lighthouse', country: 'Canada', note: 'Marks the easternmost point of North America.' },
  { name: 'Earhart Light', lat: 0.8081, lng: -176.6178, kind: 'lighthouse', country: 'USA', note: 'Remote lighthouse memorial on Howland Island.' },
  { name: 'Eddystone Lighthouse', lat: 50.1811, lng: -4.1592, kind: 'lighthouse', country: 'UK', note: 'One of the most famous rock lighthouses, off Plymouth Sound.' },
  { name: 'Isla Mujeres Lighthouse', lat: 21.2314, lng: -86.7286, kind: 'lighthouse', country: 'Mexico', note: 'Marks the island near Cancún.' },
  { name: 'Lismore Lighthouse', lat: 56.4292, lng: -5.5992, kind: 'lighthouse', country: 'UK', note: 'Guards the approach to the Sound of Mull, Scotland.' },
  { name: 'Montauk Point Light', lat: 41.0717, lng: -71.8567, kind: 'lighthouse', country: 'USA', note: "New York's oldest lighthouse, marking the tip of Long Island." },
  { name: 'Royal Sovereign Lighthouse', lat: 50.7139, lng: 0.4353, kind: 'lighthouse', country: 'UK', note: 'Offshore lighthouse platform near Eastbourne.' },
  { name: 'Santa Marta Lighthouse', lat: 38.6975, lng: -9.4211, kind: 'lighthouse', country: 'Portugal', note: 'Marks the coast at Cascais, near Lisbon.' },
  { name: 'Thomas Point Shoal Light', lat: 38.8994, lng: -76.4364, kind: 'lighthouse', country: 'USA', note: 'Last screwpile lighthouse still standing on the Chesapeake Bay.' },
  { name: 'Toledo Harbor Light', lat: 41.7469, lng: -83.3339, kind: 'lighthouse', country: 'USA', note: 'Guards the harbor entrance at Toledo, on Lake Erie.' },
  { name: 'Cape Race Lighthouse', lat: 46.6600, lng: -53.0761, kind: 'lighthouse', country: 'Canada', note: 'Historic Newfoundland lighthouse tied to the Titanic distress signal.' },
  { name: 'Castle Hill Light', lat: 41.4589, lng: -71.3608, kind: 'lighthouse', country: 'USA', note: 'Marks the entrance to Narragansett Bay, Newport.' },
  { name: 'Macquarie Lighthouse', lat: -33.8236, lng: 151.2856, kind: 'lighthouse', country: 'Australia', note: "Australia's first and oldest lighthouse site, in Sydney." },
  { name: 'Petit Minou Lighthouse', lat: 48.3597, lng: -4.6197, kind: 'lighthouse', country: 'France', note: "Guards the approach to Brest harbor, Brittany." },
  { name: 'Sergipe Light', lat: -10.9111, lng: -37.0500, kind: 'lighthouse', country: 'Brazil', note: 'Marks the coast near Aracaju.' },
  { name: 'Sandy Hook Light', lat: 40.4611, lng: -73.9928, kind: 'lighthouse', country: 'USA', note: "One of the oldest standing lighthouses in the US." },
  { name: 'Battery Point Light', lat: 41.7461, lng: -124.2100, kind: 'lighthouse', country: 'USA', note: 'Marks the harbor at Crescent City, California.' },
  { name: "Cape du Couedic Lighthouse", lat: -36.0667, lng: 136.7000, kind: 'lighthouse', country: 'Australia', note: 'Marks the rugged southwest coast of Kangaroo Island.' },
  { name: 'Green Cape Lighthouse', lat: -37.2647, lng: 149.9683, kind: 'lighthouse', country: 'Australia', note: "Marks the southernmost point of mainland New South Wales." },
  { name: 'Húsavík Light', lat: 66.0449, lng: -17.3389, kind: 'lighthouse', country: 'Iceland', note: 'Guards the harbor of Húsavík on Skjálfandaflói Bay.' },
  { name: 'Madang Lighthouse', lat: -5.2214, lng: 145.7947, kind: 'lighthouse', country: 'Papua New Guinea', note: 'Marks the harbor at Madang.' },
  { name: 'Oak Island Light', lat: 33.8847, lng: -78.0181, kind: 'lighthouse', country: 'USA', note: 'Marks the entrance to the Cape Fear River, North Carolina.' },
  { name: 'Point Pinos Lighthouse', lat: 36.6350, lng: -121.9339, kind: 'lighthouse', country: 'USA', note: 'Oldest continuously operating lighthouse on the US West Coast.' },
  { name: 'Point Prim Lighthouse', lat: 46.0561, lng: -63.0758, kind: 'lighthouse', country: 'Canada', note: "Prince Edward Island's oldest lighthouse." },
  { name: 'Cape Egmont Lighthouse', lat: -39.2967, lng: 173.9450, kind: 'lighthouse', country: 'New Zealand', note: 'Marks the Taranaki coast facing the Tasman Sea.' },
  { name: 'Cape Guardafui Lighthouse', lat: 11.8167, lng: 51.2833, kind: 'lighthouse', country: 'Somalia', note: 'Marks the Horn of Africa, one of the most remote lighthouses in the world.' },
  { name: 'Hope Town Lighthouse', lat: 26.5386, lng: -76.9814, kind: 'lighthouse', country: 'Bahamas', note: 'One of the last hand-wound kerosene lighthouses in the world.' },
  { name: 'Marjaniemi Lighthouse', lat: 65.0403, lng: 24.5561, kind: 'lighthouse', country: 'Finland', note: 'Marks Hailuoto Island in the Gulf of Bothnia.' },
  { name: 'Marshall Point Light', lat: 43.9219, lng: -69.2597, kind: 'lighthouse', country: 'USA', note: 'Marks the harbor at Port Clyde, Maine.' },
  { name: "Smeaton's Tower", lat: 50.3644, lng: -4.1408, kind: 'lighthouse', country: 'UK', note: 'Historic former Eddystone lighthouse, relocated to Plymouth Hoe.' },
  { name: 'Bass Harbor Head Light', lat: 44.2233, lng: -68.3372, kind: 'lighthouse', country: 'USA', note: "One of Maine's most photographed lighthouses, in Acadia National Park." },
  { name: 'Enragée Point Lighthouse', lat: 45.6167, lng: -60.9833, kind: 'lighthouse', country: 'Canada', note: 'Marks the Cape Breton coast near Chéticamp, Nova Scotia.' },
  { name: 'Île Vierge Lighthouse', lat: 48.6042, lng: -4.5636, kind: 'lighthouse', country: 'France', note: "The tallest stone lighthouse in Europe." },
  { name: 'Key West Lighthouse', lat: 24.5514, lng: -81.8014, kind: 'lighthouse', country: 'USA', note: "Marks the southernmost city in the continental US." },
  { name: 'West Point Light', lat: 47.6631, lng: -122.4283, kind: 'lighthouse', country: 'USA', note: "Marks Puget Sound's entrance to Seattle's Elliott Bay." },
  { name: 'Wind Point Light', lat: 42.7847, lng: -87.7789, kind: 'lighthouse', country: 'USA', note: 'One of the tallest lighthouses on the Great Lakes, in Racine, Wisconsin.' },
  { name: 'Burlington Breakwater Lights', lat: 44.4761, lng: -73.2264, kind: 'lighthouse', country: 'USA', note: 'Marks the harbor breakwater on Lake Champlain, Vermont.' },
  { name: 'California Lighthouse', lat: 12.6208, lng: -70.0428, kind: 'lighthouse', country: 'Aruba', note: "Named after a shipwreck, marking Aruba's northwestern tip." },
  { name: 'Cape Henry Lighthouse', lat: 36.9256, lng: -76.0058, kind: 'lighthouse', country: 'USA', note: 'The first lighthouse authorized by the US federal government.' },
  { name: 'Castle Point Lighthouse', lat: -40.9014, lng: 176.2192, kind: 'lighthouse', country: 'New Zealand', note: 'Marks a dramatic rocky headland on the North Island coast.' },
  { name: 'Notre-Dame-des-Anges Lighthouse', lat: 42.5256, lng: 3.0836, kind: 'lighthouse', country: 'France', note: 'Marks the harbor at Collioure on the Mediterranean coast.' },
  { name: 'Klein Curaçao Lighthouse', lat: 11.9906, lng: -68.6608, kind: 'lighthouse', country: 'Curaçao', note: 'Historic lighthouse on an uninhabited islet off Curaçao.' },
  { name: 'Porer Lighthouse', lat: 44.7503, lng: 13.8867, kind: 'lighthouse', country: 'Croatia', note: 'Marks a small island off the Istrian coast near Premantura.' },
  { name: 'Slangkop Lighthouse', lat: -34.1394, lng: 18.3242, kind: 'lighthouse', country: 'South Africa', note: "One of the tallest cast-iron lighthouses in South Africa." },
  { name: 'Louisbourg Lighthouse', lat: 45.9106, lng: -59.9636, kind: 'lighthouse', country: 'Canada', note: "Site of Canada's first lighthouse, at the historic Fortress of Louisbourg." },
  { name: 'Cabo de Palos Lighthouse', lat: 37.6386, lng: -0.6997, kind: 'lighthouse', country: 'Spain', note: 'Marks a rocky cape on the Murcia coast.' },
  { name: 'Cape Finisterre Lighthouse', lat: 42.8781, lng: -9.2714, kind: 'lighthouse', country: 'Spain', note: 'Marks the historic "end of the known world" on the Galician coast.' },
]

const shipRecyclingYards = [
  { name: 'Alang Ship Breaking Yard', lat: 21.42, lng: 72.13, kind: 'recycling', country: 'India', note: "World's largest ship recycling yard, dismantling a large share of global end-of-life tonnage." },
  { name: 'Chittagong Ship Breaking Yard', lat: 22.30, lng: 91.75, kind: 'recycling', country: 'Bangladesh', note: 'Major beach-based ship recycling yard on the Bay of Bengal.' },
  { name: 'Gadani Ship Breaking Yard', lat: 25.10, lng: 66.73, kind: 'recycling', country: 'Pakistan', note: "One of the world's largest ship-breaking yards, on the Arabian Sea coast." },
  { name: 'Aliağa Ship Recycling', lat: 38.80, lng: 26.97, kind: 'recycling', country: 'Turkey', note: "Turkey's main ship recycling hub and the largest EU-standard-compliant facility in the region." },
  { name: 'Zhangjiagang Ship Recycling', lat: 31.87, lng: 120.56, kind: 'recycling', country: 'China', note: "One of China's key ship dismantling and recycling zones on the Yangtze River." },
  { name: 'Brownsville Ship Channel', lat: 25.95, lng: -97.35, kind: 'recycling', country: 'USA', note: "The United States' primary ship recycling and scrapping hub, on the Gulf Coast." },
  { name: 'Galloo Ship Recycling – Ghent', lat: 51.09, lng: 3.72, kind: 'recycling', country: 'Belgium', note: 'Leading EU-compliant "green" ship recycling facility.' },
  { name: 'Able UK – Teesside', lat: 54.60, lng: -1.15, kind: 'recycling', country: 'UK', note: "One of Europe's largest ship recycling and decommissioning sites." },
  { name: 'Green Yard – Kleven', lat: 62.47, lng: 6.02, kind: 'recycling', country: 'Norway', note: 'Scandinavian green ship recycling facility focused on environmentally responsible dismantling.' },
  { name: 'Rotterdam Green Ship Recycling', lat: 51.90, lng: 4.48, kind: 'recycling', country: 'Netherlands', note: 'Modern environmentally-compliant recycling facility serving Northern European shipping.' },
  { name: 'Leyal Ship Recycling – Aliağa', lat: 38.79, lng: 26.98, kind: 'recycling', country: 'Turkey', note: 'One of several dedicated EU-flagged-compliant yards at the Aliağa recycling zone.' },
  { name: 'Kaohsiung Ship Recycling', lat: 22.58, lng: 120.28, kind: 'recycling', country: 'Taiwan', note: 'Historic East Asian ship dismantling site, now much reduced in scale.' },
  { name: 'Mumbai Ship Breaking (Darukhana)', lat: 18.96, lng: 72.85, kind: 'recycling', country: 'India', note: "One of India's older ship-breaking sites, smaller scale than Alang." },
  { name: 'Jiangyin Ship Recycling', lat: 31.91, lng: 120.28, kind: 'recycling', country: 'China', note: 'Yangtze River ship dismantling facility supporting Chinese domestic fleet retirement.' },
  { name: 'Avilés Ship Recycling', lat: 43.57, lng: -5.92, kind: 'recycling', country: 'Spain', note: 'One of the few EU-compliant ship recycling sites on the Iberian Peninsula.' },
]

const bunkeringStations = [
  { name: 'Port of Singapore Bunkering Hub', lat: 1.26, lng: 103.82, kind: 'bunker', country: 'Singapore', note: "World's largest bunkering port by volume, ~55 million metric tons annually." },
  { name: 'Fujairah Bunkering Anchorage', lat: 25.12, lng: 56.34, kind: 'bunker', country: 'UAE', note: "World's second/third-largest bunkering port, at the Strait of Hormuz crossroads." },
  { name: 'Rotterdam Bunkering Hub', lat: 51.95, lng: 4.14, kind: 'bunker', country: 'Netherlands', note: "Europe's largest bunkering port." },
  { name: 'Zhoushan Bunkering Hub', lat: 29.98, lng: 122.21, kind: 'bunker', country: 'China', note: "China's top bunkering hub, now ranked among the world's top 4-5 by volume." },
  { name: 'Hong Kong Bunkering Hub', lat: 22.28, lng: 114.16, kind: 'bunker', country: 'Hong Kong', note: 'Historic top-5 global bunkering port.' },
  { name: 'Antwerp Bunkering Hub', lat: 51.29, lng: 4.34, kind: 'bunker', country: 'Belgium', note: "One of Europe's top 5 bunkering ports by volume." },
  { name: 'Busan Bunkering Hub', lat: 35.10, lng: 129.04, kind: 'bunker', country: 'South Korea', note: 'Named by OPEC among key secondary global bunkering ports.' },
  { name: 'Gibraltar Bunkering Anchorage', lat: 36.14, lng: -5.35, kind: 'bunker', country: 'Gibraltar', note: 'Strategic Mediterranean-Atlantic gateway bunkering stop.' },
  { name: 'Panama Canal Bunkering (Balboa/Cristóbal)', lat: 8.95, lng: -79.55, kind: 'bunker', country: 'Panama', note: 'Named by OPEC among key global bunkering ports.' },
  { name: 'Algeciras Bunkering Hub', lat: 36.14, lng: -5.45, kind: 'bunker', country: 'Spain', note: 'Named by OPEC among key global bunkering ports.' },
  { name: 'Los Angeles/Long Beach Bunkering', lat: 33.74, lng: -118.26, kind: 'bunker', country: 'USA', note: "Named by OPEC among key global bunkering ports; West Coast USA's primary hub." },
  { name: 'Shanghai Bunkering Hub', lat: 31.23, lng: 121.47, kind: 'bunker', country: 'China', note: 'Named by OPEC among key global bunkering ports.' },
  { name: 'Piraeus Bunkering Hub', lat: 37.94, lng: 23.65, kind: 'bunker', country: 'Greece', note: "Greece's main bunkering port, tied to the world's largest privately-owned shipping fleet." },
  { name: 'Port Said Bunkering', lat: 31.26, lng: 32.30, kind: 'bunker', country: 'Egypt', note: 'Bunkering point at the Mediterranean approach to the Suez Canal.' },
  { name: 'Tanjung Pelepas Bunkering', lat: 1.36, lng: 103.55, kind: 'bunker', country: 'Malaysia', note: 'Key regional hub near the Strait of Malacca.' },
  { name: 'Houston Bunkering Hub', lat: 29.73, lng: -95.02, kind: 'bunker', country: 'USA', note: 'Primary Gulf Coast bunkering port tied to major US refining infrastructure.' },
  { name: 'Colombo Bunkering Hub', lat: 6.95, lng: 79.84, kind: 'bunker', country: 'Sri Lanka', note: 'Major Indian Ocean bunkering stop on the Europe-Asia shipping route.' },
  { name: 'Yokohama Bunkering Hub', lat: 35.44, lng: 139.64, kind: 'bunker', country: 'Japan', note: "Japan's principal bunkering port for East Asian routes." },
  { name: 'Ulsan Bunkering Hub', lat: 35.50, lng: 129.38, kind: 'bunker', country: 'South Korea', note: 'Key bunkering hub tied to South Korean refining industry.' },
  { name: 'New York/New Jersey Bunkering', lat: 40.68, lng: -74.03, kind: 'bunker', country: 'USA', note: "US East Coast's primary bunkering port." },
  { name: 'Durban Bunkering Hub', lat: -29.87, lng: 31.02, kind: 'bunker', country: 'South Africa', note: "Africa's busiest bunkering port, on the Cape sea route." },
  { name: 'Las Palmas Bunkering Hub', lat: 28.15, lng: -15.41, kind: 'bunker', country: 'Spain', note: 'Major Atlantic bunkering stop in the Canary Islands.' },
  { name: 'Ningbo-Zhoushan Bunkering', lat: 29.87, lng: 121.55, kind: 'bunker', country: 'China', note: "Part of the world's busiest cargo port complex by tonnage." },
  { name: 'Jebel Ali Bunkering Hub', lat: 25.01, lng: 55.06, kind: 'bunker', country: 'UAE', note: "Major Middle East bunkering point at the region's largest port." },
  { name: 'Constanța Bunkering Hub', lat: 44.16, lng: 28.65, kind: 'bunker', country: 'Romania', note: "Romania's main Black Sea bunkering port." },
  { name: 'Novorossiysk Bunkering Hub', lat: 44.72, lng: 37.78, kind: 'bunker', country: 'Russia', note: "Russia's largest Black Sea bunkering and export port." },
  { name: 'Santos Bunkering Hub', lat: -23.99, lng: -46.30, kind: 'bunker', country: 'Brazil', note: "Latin America's busiest port, key regional bunkering stop." },
  { name: 'Cartagena Bunkering Hub', lat: 10.40, lng: -75.51, kind: 'bunker', country: 'Colombia', note: 'Key Caribbean bunkering stop near the Panama Canal approach.' },
  { name: 'Suez Bunkering Hub', lat: 29.97, lng: 32.55, kind: 'bunker', country: 'Egypt', note: 'Bunkering point at the southern end of the Suez Canal.' },
  { name: 'Dalian Bunkering Hub', lat: 38.93, lng: 121.61, kind: 'bunker', country: 'China', note: "Major bunkering port on China's Bohai Sea coast." },
]

const dryDocks = [
  { name: 'Dubai Drydocks World', lat: 25.27, lng: 55.05, kind: 'drydock', country: 'UAE', note: 'One of the largest dry-dock repair and conversion complexes in the Middle East.' },
  { name: 'Keppel Shipyard – Singapore', lat: 1.29, lng: 103.65, kind: 'drydock', country: 'Singapore', note: 'Major ship repair, conversion, and offshore rig dry-dock facility.' },
  { name: 'CSBC Kaohsiung Shipyard', lat: 22.58, lng: 120.28, kind: 'drydock', country: 'Taiwan', note: "Home to one of the world's largest dry docks, at 950m long." },
  { name: 'Hyundai Heavy Industries – Gunsan', lat: 35.97, lng: 126.68, kind: 'drydock', country: 'South Korea', note: 'Ten 700m dry docks capable of building and repairing vessels of any size.' },
  { name: 'Hyundai Samho Heavy Industries', lat: 34.68, lng: 126.44, kind: 'drydock', country: 'South Korea', note: 'One of the largest dry-dock complexes globally, 3.7 million GT annual capacity.' },
  { name: "Chantiers de l'Atlantique – Saint-Nazaire", lat: 47.28, lng: -2.20, kind: 'drydock', country: 'France', note: "Home to one of the largest dry docks in the world, at nearly 1,200m long." },
  { name: 'Cammell Laird – Birkenhead', lat: 53.39, lng: -3.00, kind: 'drydock', country: 'UK', note: 'Historic dry dock on the Mersey, still active in ship repair and defense work.' },
  { name: 'Navantia – Cádiz', lat: 36.53, lng: -6.28, kind: 'drydock', country: 'Spain', note: 'Major naval and commercial dry-dock shipyard on the Atlantic coast.' },
  { name: 'Colombo Dockyard', lat: 6.95, lng: 79.85, kind: 'drydock', country: 'Sri Lanka', note: "One of South Asia's key ship repair dry docks, positioned on major Indian Ocean routes." },
  { name: 'Rio de Janeiro Dry Dock', lat: -22.80, lng: -43.20, kind: 'drydock', country: 'Brazil', note: "Key South Atlantic dry dock supporting Brazil's offshore oil industry." },
  { name: 'Alexandria Shipyard', lat: 31.20, lng: 29.88, kind: 'drydock', country: 'Egypt', note: 'Major dry dock near the Suez Canal, servicing vessels transiting the Mediterranean-Red Sea route.' },
  { name: 'Balboa Shipyard – Panama City', lat: 8.95, lng: -79.57, kind: 'drydock', country: 'Panama', note: 'Key repair dry dock at the Pacific entrance of the Panama Canal.' },
  { name: 'Hong Kong United Dockyards – Tsing Yi', lat: 22.36, lng: 114.10, kind: 'drydock', country: 'Hong Kong', note: "One of Hong Kong's principal ship repair dry docks." },
  { name: 'Sturrock Dry Dock – Cape Town', lat: 33.90, lng: 18.43, kind: 'drydock', country: 'South Africa', note: 'Major Southern Hemisphere dry dock servicing vessels rounding the Cape of Good Hope.' },
  { name: 'Detyens Shipyards – Charleston', lat: 32.83, lng: -79.98, kind: 'drydock', country: 'USA', note: 'US East Coast graving-dock facility capable of servicing Panamax vessels.' },
  { name: 'Newport News Shipbuilding – Dry Dock 12', lat: 36.98, lng: -76.43, kind: 'drydock', country: 'USA', note: 'Largest dry dock in the United States.' },
  { name: 'Alabama Shipyard – Mobile', lat: 30.68, lng: -88.04, kind: 'drydock', country: 'USA', note: 'Major Gulf Coast dry-dock repair facility.' },
  { name: 'ASMAR Shipyards – Talcahuano', lat: -36.72, lng: -73.12, kind: 'drydock', country: 'Chile', note: "Chile's principal naval and commercial dry dock." },
  { name: 'Sumitomo Heavy Industries – Yokosuka', lat: 35.30, lng: 139.67, kind: 'drydock', country: 'Japan', note: 'Major Japanese dry-dock repair and shipbuilding yard.' },
  { name: 'New Times Shipyard – Jingjiang', lat: 32.02, lng: 120.27, kind: 'drydock', country: 'China', note: 'Large Yangtze River dry-dock shipbuilding complex.' },
]
const shipyards = [
  { name: 'Hyundai Heavy Industries – Ulsan', lat: 35.50, lng: 129.38, kind: 'shipyard', country: 'South Korea', note: "World's largest shipbuilding facility by output." },
  { name: 'Samsung Heavy Industries – Geoje', lat: 34.81, lng: 128.62, kind: 'shipyard', country: 'South Korea', note: 'Major builder of LNG carriers, drillships, and offshore platforms.' },
  { name: 'Hanwha Ocean (Daewoo) – Geoje', lat: 34.83, lng: 128.70, kind: 'shipyard', country: 'South Korea', note: 'Top global builder of LNG carriers and naval vessels.' },
  { name: 'Hyundai Heavy Industries – Gunsan', lat: 35.97, lng: 126.68, kind: 'shipyard', country: 'South Korea', note: 'Ten 700m dry docks for vessels of any size.' },
  { name: 'Hyundai Samho Heavy Industries', lat: 34.68, lng: 126.44, kind: 'shipyard', country: 'South Korea', note: 'One of the largest shipbuilding complexes globally.' },
  { name: 'HD Hyundai Mipo Dockyard', lat: 35.49, lng: 129.39, kind: 'shipyard', country: 'South Korea', note: "One of the world's leading mid-size vessel and tanker builders." },
  { name: 'HJ Shipbuilding & Construction (formerly Hanjin)', lat: 35.10, lng: 129.03, kind: 'shipyard', country: 'South Korea', note: 'Major Busan-based commercial and naval shipbuilder.' },
  { name: 'Sungdong Shipbuilding – Tongyeong', lat: 34.85, lng: 128.43, kind: 'shipyard', country: 'South Korea', note: 'Major South Korean mid-size tanker and bulk carrier builder.' },
  { name: 'STX Offshore & Shipbuilding – Jinhae', lat: 35.15, lng: 128.68, kind: 'shipyard', country: 'South Korea', note: 'Major South Korean commercial vessel builder.' },
  { name: 'Jiangnan Shipyard – Shanghai', lat: 31.20, lng: 121.79, kind: 'shipyard', country: 'China', note: "China's oldest and one of its largest shipyards." },
  { name: 'Waigaoqiao Shipbuilding – Shanghai', lat: 31.35, lng: 121.62, kind: 'shipyard', country: 'China', note: 'Major bulk carrier and tanker construction yard under CSSC.' },
  { name: 'Dalian Shipbuilding Industry Co.', lat: 38.93, lng: 121.63, kind: 'shipyard', country: 'China', note: 'Major shipbuilding and repair yard on the Bohai Sea.' },
  { name: 'New Times Shipyard – Jingjiang', lat: 32.02, lng: 120.27, kind: 'shipyard', country: 'China', note: 'Large Yangtze River shipbuilding complex.' },
  { name: 'Guangzhou Shipyard International', lat: 23.10, lng: 113.42, kind: 'shipyard', country: 'China', note: 'Major South China shipbuilder for commercial and offshore vessels.' },
  { name: 'Yangzijiang Shipbuilding', lat: 32.02, lng: 120.27, kind: 'shipyard', country: 'China', note: "One of China's largest private shipbuilders." },
  { name: 'CSSC Wuchang Shipbuilding', lat: 30.55, lng: 114.30, kind: 'shipyard', country: 'China', note: 'Historic Yangtze River shipyard, now a major naval and commercial builder.' },
  { name: 'Jinling Shipyard – Nanjing', lat: 32.06, lng: 118.80, kind: 'shipyard', country: 'China', note: "One of China's leading tanker and chemical carrier builders." },
  { name: 'Nantong COSCO KHI Ship Engineering', lat: 32.08, lng: 120.86, kind: 'shipyard', country: 'China', note: 'Major China-Japan joint-venture shipyard.' },
  { name: 'China Merchants Industry Shipyard – Shenzhen', lat: 22.47, lng: 113.88, kind: 'shipyard', country: 'China', note: 'Major South China shipbuilder and offshore fabricator.' },
  { name: 'Huangpu Wenchong Shipbuilding', lat: 23.10, lng: 113.47, kind: 'shipyard', country: 'China', note: 'Major Guangzhou-area naval and commercial shipbuilder.' },
  { name: 'Cosco Shipping Heavy Industry – Qidong', lat: 31.80, lng: 121.66, kind: 'shipyard', country: 'China', note: 'Large Yangtze estuary shipbuilding complex.' },
  { name: 'Fujian Southeast Shipyard', lat: 24.98, lng: 118.68, kind: 'shipyard', country: 'China', note: 'Major mid-size vessel builder on the Taiwan Strait coast.' },
  { name: 'Mitsubishi Heavy Industries – Nagasaki', lat: 32.75, lng: 129.87, kind: 'shipyard', country: 'Japan', note: 'Historic shipyard building large commercial vessels and ferries.' },
  { name: 'Imabari Shipbuilding – Ehime', lat: 34.07, lng: 132.99, kind: 'shipyard', country: 'Japan', note: "Japan's largest shipbuilder by tonnage." },
  { name: 'Japan Marine United – Yokohama', lat: 35.44, lng: 139.65, kind: 'shipyard', country: 'Japan', note: 'Major merged shipbuilder formed from IHI and Universal Shipbuilding.' },
  { name: 'Sumitomo Heavy Industries – Yokosuka', lat: 35.30, lng: 139.67, kind: 'shipyard', country: 'Japan', note: 'Major Japanese shipbuilding and repair yard.' },
  { name: 'Tsuneishi Shipbuilding', lat: 34.36, lng: 133.32, kind: 'shipyard', country: 'Japan', note: "One of Japan's largest bulk carrier builders." },
  { name: 'Oshima Shipbuilding', lat: 32.83, lng: 129.98, kind: 'shipyard', country: 'Japan', note: 'Major Japanese builder of bulk carriers and tankers.' },
  { name: 'Onomichi Shipbuilding (Japan Marine United)', lat: 34.41, lng: 133.20, kind: 'shipyard', country: 'Japan', note: 'Key Japanese mid-size commercial shipbuilder.' },
  { name: 'CSBC Kaohsiung Shipyard', lat: 22.58, lng: 120.28, kind: 'shipyard', country: 'Taiwan', note: "Home to one of the world's largest dry docks." },
  { name: 'Cochin Shipyard – Kochi', lat: 9.95, lng: 76.27, kind: 'shipyard', country: 'India', note: "India's largest shipyard." },
  { name: 'Hindustan Shipyard – Visakhapatnam', lat: 17.68, lng: 83.22, kind: 'shipyard', country: 'India', note: "India's oldest and largest defense/commercial shipyard on the east coast." },
  { name: 'Mazagon Dock – Mumbai', lat: 18.95, lng: 72.85, kind: 'shipyard', country: 'India', note: "One of India's premier shipbuilding yards." },
  { name: 'Larsen & Toubro Shipyard – Kattupalli', lat: 13.29, lng: 80.32, kind: 'shipyard', country: 'India', note: "One of India's most modern shipbuilding facilities." },
  { name: 'Goa Shipyard Limited', lat: 15.40, lng: 73.83, kind: 'shipyard', country: 'India', note: 'Major Indian naval and commercial shipbuilder on the west coast.' },
  { name: 'Garden Reach Shipbuilders – Kolkata', lat: 22.54, lng: 88.31, kind: 'shipyard', country: 'India', note: "One of India's oldest shipyards, on the Hooghly River." },
  { name: 'HD Hyundai Subic Shipyard', lat: 14.79, lng: 120.28, kind: 'shipyard', country: 'Philippines', note: 'One of the largest shipyards in Southeast Asia.' },
  { name: 'Damen Shipyards – Vietnam (Song Cam)', lat: 20.85, lng: 106.73, kind: 'shipyard', country: 'Vietnam', note: 'Major Southeast Asian yard building tankers and offshore vessels.' },
  { name: 'Vard Vung Tau', lat: 10.35, lng: 107.08, kind: 'shipyard', country: 'Vietnam', note: 'Major offshore support vessel yard, part of the Vard/Fincantieri group.' },
  { name: 'Sembcorp Marine – Tuas', lat: 1.32, lng: 103.64, kind: 'shipyard', country: 'Singapore', note: "One of the world's leading offshore rig and specialized vessel builders." },
  { name: 'Keppel Shipyard – Singapore (Shipbuilding Division)', lat: 1.29, lng: 103.65, kind: 'shipyard', country: 'Singapore', note: 'Major offshore rig and specialized vessel construction yard.' },
  { name: 'PaxOcean Shipyard – Batam', lat: 1.13, lng: 104.05, kind: 'shipyard', country: 'Indonesia', note: 'Major offshore vessel and rig fabrication yard near Singapore.' },
  { name: 'ASRY – Bahrain', lat: 26.20, lng: 50.61, kind: 'shipyard', country: 'Bahrain', note: "One of the Middle East's largest ship repair and building yards." },
  { name: 'Abu Dhabi Ship Building (ADSB)', lat: 24.42, lng: 54.47, kind: 'shipyard', country: 'UAE', note: "One of the UAE's principal naval and commercial shipbuilders." },
  { name: 'Lamprell – Hamriyah', lat: 25.42, lng: 55.46, kind: 'shipyard', country: 'UAE', note: 'Major fabricator of offshore rigs and specialized marine vessels.' },
  { name: 'Tuzla Shipyards Zone – Istanbul', lat: 40.82, lng: 29.35, kind: 'shipyard', country: 'Turkey', note: "Turkey's principal shipbuilding hub, home to dozens of yards." },
  { name: 'RMK Marine – Tuzla', lat: 40.82, lng: 29.36, kind: 'shipyard', country: 'Turkey', note: 'Major Turkish builder of naval and commercial vessels.' },
  { name: 'Karachi Shipyard & Engineering Works', lat: 24.85, lng: 66.98, kind: 'shipyard', country: 'Pakistan', note: "Pakistan's principal naval and commercial shipbuilding yard." },
  { name: 'Chittagong Dry Dock Limited', lat: 22.31, lng: 91.79, kind: 'shipyard', country: 'Bangladesh', note: "Bangladesh's leading state-owned shipbuilding and repair yard." },
  { name: 'Colombo Dockyard – Shipbuilding Division', lat: 6.95, lng: 79.85, kind: 'shipyard', country: 'Sri Lanka', note: 'Major South Asian commercial vessel builder and repairer.' },
  { name: 'Fincantieri – Monfalcone', lat: 45.79, lng: 13.53, kind: 'shipyard', country: 'Italy', note: "One of Europe's largest cruise-ship-building shipyards." },
  { name: 'Fincantieri – Marghera', lat: 45.48, lng: 12.24, kind: 'shipyard', country: 'Italy', note: 'Major Venice-area shipyard for cruise vessel construction.' },
  { name: 'Fincantieri – Ancona', lat: 43.60, lng: 13.51, kind: 'shipyard', country: 'Italy', note: 'Major Italian cruise ship construction site.' },
  { name: 'Fincantieri – Castellammare di Stabia', lat: 40.70, lng: 14.48, kind: 'shipyard', country: 'Italy', note: 'Historic Italian shipbuilding yard near Naples.' },
  { name: 'Meyer Werft – Papenburg', lat: 53.07, lng: 7.40, kind: 'shipyard', country: 'Germany', note: 'Leading cruise ship builder on the Ems river.' },
  { name: 'Thyssenkrupp Marine Systems – Kiel', lat: 54.32, lng: 10.14, kind: 'shipyard', country: 'Germany', note: 'Major German naval and commercial shipbuilder.' },
  { name: 'Blohm+Voss – Hamburg', lat: 53.54, lng: 9.96, kind: 'shipyard', country: 'Germany', note: 'Historic German shipyard, now focused on repair and superyachts.' },
  { name: 'Lloyd Werft – Bremerhaven', lat: 53.53, lng: 8.58, kind: 'shipyard', country: 'Germany', note: 'Major German cruise ship repair and conversion yard.' },
  { name: 'Nordic Yards – Wismar', lat: 53.90, lng: 11.47, kind: 'shipyard', country: 'Germany', note: 'Former MTW Schiffswerft yard on the Baltic, specialty vessel construction.' },
  { name: "Chantiers de l'Atlantique – Saint-Nazaire", lat: 47.28, lng: -2.20, kind: 'shipyard', country: 'France', note: 'Home to one of the largest dry docks in the world.' },
  { name: 'Naval Group – Lorient', lat: 47.75, lng: -3.37, kind: 'shipyard', country: 'France', note: "France's principal naval shipbuilding yard." },
  { name: 'STX France – Saint-Nazaire', lat: 47.28, lng: -2.20, kind: 'shipyard', country: 'France', note: 'Major French cruise and naval vessel construction site.' },
  { name: 'Navantia – Ferrol', lat: 43.48, lng: -8.24, kind: 'shipyard', country: 'Spain', note: 'Major Spanish naval and commercial shipbuilding yard.' },
  { name: 'Astilleros Gondan', lat: 43.55, lng: -6.38, kind: 'shipyard', country: 'Spain', note: 'Spanish builder of specialty and research vessels.' },
  { name: 'Freire Shipyard – Vigo', lat: 42.24, lng: -8.72, kind: 'shipyard', country: 'Spain', note: 'Major Spanish fishing and specialty vessel builder.' },
  { name: 'Damen Shipyards – Gorinchem', lat: 51.83, lng: 4.98, kind: 'shipyard', country: 'Netherlands', note: 'Headquarters yard of the major Damen Group shipbuilding network.' },
  { name: 'Damen Shipyards – Schelde', lat: 51.45, lng: 3.83, kind: 'shipyard', country: 'Netherlands', note: 'Major Dutch naval and commercial shipbuilder.' },
  { name: 'Damen Shipyards Bergum', lat: 53.20, lng: 6.00, kind: 'shipyard', country: 'Netherlands', note: 'Specialty inland vessel builder, part of the Damen Group.' },
  { name: 'Uljanik Shipyard – Pula', lat: 44.87, lng: 13.85, kind: 'shipyard', country: 'Croatia', note: 'Historic Adriatic shipyard, one of the oldest in Europe.' },
  { name: 'Remontowa Shipyard – Gdańsk', lat: 54.36, lng: 18.67, kind: 'shipyard', country: 'Poland', note: "One of Europe's largest ship repair and conversion yards." },
  { name: 'Crist Shipyard – Gdynia', lat: 54.53, lng: 18.55, kind: 'shipyard', country: 'Poland', note: 'Major Baltic shipbuilder, known for offshore wind vessels.' },
  { name: 'Meyer Turku', lat: 60.42, lng: 22.18, kind: 'shipyard', country: 'Finland', note: 'Leading cruise ship builder, part of the Meyer Group.' },
  { name: 'Wärtsilä Shipyard – Turku (historic)', lat: 60.42, lng: 22.18, kind: 'shipyard', country: 'Finland', note: 'Historic Finnish shipbuilding site, precursor to modern Meyer Turku.' },
  { name: 'Ulstein Verft', lat: 62.35, lng: 5.85, kind: 'shipyard', country: 'Norway', note: 'Innovative Norwegian builder of offshore and specialty vessels.' },
  { name: 'Vard Group – Søviknes', lat: 62.68, lng: 6.80, kind: 'shipyard', country: 'Norway', note: 'Major Norwegian builder of offshore support and specialty vessels.' },
  { name: 'Harland & Wolff – Belfast', lat: 54.61, lng: -5.90, kind: 'shipyard', country: 'UK', note: "Historic shipyard that built the Titanic, still active in repair and fabrication." },
  { name: 'Babcock Marine – Rosyth', lat: 56.03, lng: -3.44, kind: 'shipyard', country: 'UK', note: "One of the UK's principal naval shipbuilding and refit yards." },
  { name: 'Elefsis Shipyards', lat: 38.04, lng: 23.54, kind: 'shipyard', country: 'Greece', note: "One of Greece's major shipyards." },
  { name: 'Zvezda Shipbuilding Complex', lat: 43.11, lng: 132.15, kind: 'shipyard', country: 'Russia', note: "Russia's largest and most modern shipyard." },
  { name: 'Severnaya Verf – St. Petersburg', lat: 59.87, lng: 30.19, kind: 'shipyard', country: 'Russia', note: 'Major Russian Baltic shipbuilding yard.' },
  { name: 'Admiralty Shipyards – St. Petersburg', lat: 59.92, lng: 30.28, kind: 'shipyard', country: 'Russia', note: "One of Russia's oldest and largest shipbuilding yards." },
  { name: 'Vard Braila', lat: 45.27, lng: 27.98, kind: 'shipyard', country: 'Romania', note: 'Major Romanian shipyard on the Danube, part of the Vard/Fincantieri group.' },
  { name: 'Damen Shipyards Mangalia', lat: 43.81, lng: 28.58, kind: 'shipyard', country: 'Romania', note: "One of the largest shipyards on the Black Sea." },
  { name: 'Damen Shipyards Galați', lat: 45.44, lng: 28.03, kind: 'shipyard', country: 'Romania', note: 'Major Danube River shipbuilding yard.' },
  { name: 'Newport News Shipbuilding', lat: 36.98, lng: -76.43, kind: 'shipyard', country: 'USA', note: 'Major US shipbuilder, historically significant for large vessels.' },
  { name: 'Bath Iron Works', lat: 43.90, lng: -69.82, kind: 'shipyard', country: 'USA', note: 'Historic Maine shipyard, primarily naval construction.' },
  { name: 'Halifax Shipyard', lat: 44.66, lng: -63.58, kind: 'shipyard', country: 'Canada', note: "Canada's principal large-vessel shipbuilding yard." },
  { name: 'ASMAR Shipyards – Talcahuano', lat: -36.72, lng: -73.12, kind: 'shipyard', country: 'Chile', note: "Chile's principal naval and commercial shipyard." },
  { name: 'Estaleiro Atlântico Sul – Pernambuco', lat: -8.30, lng: -34.93, kind: 'shipyard', country: 'Brazil', note: "One of Brazil's largest modern shipyards, built for offshore/oil vessels." },
  { name: 'Astillero Río Santiago', lat: -34.85, lng: -57.90, kind: 'shipyard', country: 'Argentina', note: "Argentina's oldest and largest state shipyard." },
  { name: 'Alexandria Shipyard', lat: 31.20, lng: 29.88, kind: 'shipyard', country: 'Egypt', note: 'Major shipyard near the Suez Canal.' },
  { name: 'Damen Shipyards Cape Town', lat: -33.90, lng: 18.43, kind: 'shipyard', country: 'South Africa', note: 'Major Southern Hemisphere shipbuilding and repair facility.' },
]


const wetDocks = [
  { name: 'Royal Albert Dock – London', lat: 51.508, lng: 0.056, kind: 'wetdock', country: 'UK', note: 'Historic enclosed wet dock on the Thames, once part of the busiest port complex in the world.' },
  { name: 'Waalhaven – Rotterdam', lat: 51.89, lng: 4.45, kind: 'wetdock', country: 'Netherlands', note: "One of the world's largest artificial wet-dock harbor basins." },
  { name: 'Kattendijkdok – Antwerp', lat: 51.24, lng: 4.41, kind: 'wetdock', country: 'Belgium', note: "Historic wet dock at the heart of Antwerp's port complex." },
  { name: 'Le Havre Wet Docks', lat: 49.49, lng: 0.11, kind: 'wetdock', country: 'France', note: "France's largest container port, built around enclosed wet-dock basins." },
  { name: 'Hamburg Harbour Wet Docks', lat: 53.54, lng: 9.99, kind: 'wetdock', country: 'Germany', note: "One of Europe's largest port complexes, built on tidal wet-dock basins along the Elbe." },
  { name: 'Kidderpore Docks – Kolkata', lat: 22.54, lng: 88.31, kind: 'wetdock', country: 'India', note: "Historic wet dock on the Hooghly River, once colonial India's principal port." },
  { name: 'Cockatoo Island Wet Dock – Sydney', lat: -33.85, lng: 151.17, kind: 'wetdock', country: 'Australia', note: 'Historic Australian naval and commercial wet dock in Sydney Harbour.' },
  { name: 'Erie Basin – Brooklyn', lat: 40.67, lng: -74.01, kind: 'wetdock', country: 'USA', note: "Historic New York Harbor wet dock, part of the city's 19th-century maritime trade infrastructure." },
  { name: 'Alexandra Basin – Dublin Port', lat: 53.34, lng: -6.20, kind: 'wetdock', country: 'Ireland', note: "Ireland's principal wet dock, handling most of the country's seaborne trade." },
  { name: 'Salford Docks – Manchester', lat: 53.47, lng: -2.30, kind: 'wetdock', country: 'UK', note: 'Former inland wet dock complex connected via the Manchester Ship Canal.' },
]

const kindLabels = {
  port: 'Port / Harbour',
  lighthouse: 'Lighthouse',
  shipyard: 'Shipyard',
  recycling: 'Ship Recycling Yard',
  bunker: 'Bunkering Station',
  drydock: 'Dry Dock',
  wetdock: 'Wet Dock',
  congestion: 'Port Congestion (Live)',
}


const COUNTRY_NAMES = {
  AD: 'Andorra', AE: 'United Arab Emirates', AF: 'Afghanistan', AG: 'Antigua and Barbuda', AI: 'Anguilla',
  AL: 'Albania', AM: 'Armenia', AO: 'Angola', AQ: 'Antarctica', AR: 'Argentina', AS: 'American Samoa',
  AT: 'Austria', AU: 'Australia', AW: 'Aruba', AX: 'Åland Islands', AZ: 'Azerbaijan',
  BA: 'Bosnia and Herzegovina', BB: 'Barbados', BD: 'Bangladesh', BE: 'Belgium', BF: 'Burkina Faso',
  BG: 'Bulgaria', BH: 'Bahrain', BI: 'Burundi', BJ: 'Benin', BL: 'Saint Barthélemy', BM: 'Bermuda',
  BN: 'Brunei', BO: 'Bolivia', BQ: 'Bonaire, Sint Eustatius and Saba', BR: 'Brazil', BS: 'Bahamas',
  BT: 'Bhutan', BV: 'Bouvet Island', BW: 'Botswana', BY: 'Belarus', BZ: 'Belize',
  CA: 'Canada', CC: 'Cocos Islands', CD: 'DR Congo', CF: 'Central African Republic', CG: 'Congo',
  CH: 'Switzerland', CI: "Côte d'Ivoire", CK: 'Cook Islands', CL: 'Chile', CM: 'Cameroon', CN: 'China',
  CO: 'Colombia', CR: 'Costa Rica', CU: 'Cuba', CV: 'Cabo Verde', CW: 'Curaçao', CX: 'Christmas Island',
  CY: 'Cyprus', CZ: 'Czechia',
  DE: 'Germany', DJ: 'Djibouti', DK: 'Denmark', DM: 'Dominica', DO: 'Dominican Republic', DZ: 'Algeria',
  EC: 'Ecuador', EE: 'Estonia', EG: 'Egypt', EH: 'Western Sahara', ER: 'Eritrea', ES: 'Spain', ET: 'Ethiopia',
  FI: 'Finland', FJ: 'Fiji', FK: 'Falkland Islands', FM: 'Micronesia', FO: 'Faroe Islands', FR: 'France',
  GA: 'Gabon', GB: 'United Kingdom', GD: 'Grenada', GE: 'Georgia', GF: 'French Guiana', GG: 'Guernsey',
  GH: 'Ghana', GI: 'Gibraltar', GL: 'Greenland', GM: 'Gambia', GN: 'Guinea', GP: 'Guadeloupe',
  GQ: 'Equatorial Guinea', GR: 'Greece', GS: 'South Georgia', GT: 'Guatemala', GU: 'Guam',
  GW: 'Guinea-Bissau', GY: 'Guyana',
  HK: 'Hong Kong', HM: 'Heard Island', HN: 'Honduras', HR: 'Croatia', HT: 'Haiti', HU: 'Hungary',
  ID: 'Indonesia', IE: 'Ireland', IL: 'Israel', IM: 'Isle of Man', IN: 'India',
  IO: 'British Indian Ocean Territory', IQ: 'Iraq', IR: 'Iran', IS: 'Iceland', IT: 'Italy',
  JE: 'Jersey', JM: 'Jamaica', JO: 'Jordan', JP: 'Japan',
  KE: 'Kenya', KG: 'Kyrgyzstan', KH: 'Cambodia', KI: 'Kiribati', KM: 'Comoros', KN: 'Saint Kitts and Nevis',
  KP: 'North Korea', KR: 'South Korea', KW: 'Kuwait', KY: 'Cayman Islands', KZ: 'Kazakhstan',
  LA: 'Laos', LB: 'Lebanon', LC: 'Saint Lucia', LI: 'Liechtenstein', LK: 'Sri Lanka', LR: 'Liberia',
  LS: 'Lesotho', LT: 'Lithuania', LU: 'Luxembourg', LV: 'Latvia', LY: 'Libya',
  MA: 'Morocco', MC: 'Monaco', MD: 'Moldova', ME: 'Montenegro', MF: 'Saint Martin', MG: 'Madagascar',
  MH: 'Marshall Islands', MK: 'North Macedonia', ML: 'Mali', MM: 'Myanmar', MN: 'Mongolia', MO: 'Macao',
  MP: 'Northern Mariana Islands', MQ: 'Martinique', MR: 'Mauritania', MS: 'Montserrat', MT: 'Malta',
  MU: 'Mauritius', MV: 'Maldives', MW: 'Malawi', MX: 'Mexico', MY: 'Malaysia', MZ: 'Mozambique',
  NA: 'Namibia', NC: 'New Caledonia', NE: 'Niger', NF: 'Norfolk Island', NG: 'Nigeria', NI: 'Nicaragua',
  NL: 'Netherlands', NO: 'Norway', NP: 'Nepal', NR: 'Nauru', NU: 'Niue', NZ: 'New Zealand',
  OM: 'Oman',
  PA: 'Panama', PE: 'Peru', PF: 'French Polynesia', PG: 'Papua New Guinea', PH: 'Philippines',
  PK: 'Pakistan', PL: 'Poland', PM: 'Saint Pierre and Miquelon', PN: 'Pitcairn Islands',
  PR: 'Puerto Rico', PS: 'Palestine', PT: 'Portugal', PW: 'Palau', PY: 'Paraguay',
  QA: 'Qatar',
  RE: 'Réunion', RO: 'Romania', RS: 'Serbia', RU: 'Russia', RW: 'Rwanda',
  SA: 'Saudi Arabia', SB: 'Solomon Islands', SC: 'Seychelles', SD: 'Sudan', SE: 'Sweden', SG: 'Singapore',
  SH: 'Saint Helena', SI: 'Slovenia', SJ: 'Svalbard and Jan Mayen', SK: 'Slovakia', SL: 'Sierra Leone',
  SM: 'San Marino', SN: 'Senegal', SO: 'Somalia', SR: 'Suriname', SS: 'South Sudan',
  ST: 'São Tomé and Príncipe', SV: 'El Salvador', SX: 'Sint Maarten', SY: 'Syria', SZ: 'Eswatini',
  TC: 'Turks and Caicos Islands', TD: 'Chad', TF: 'French Southern Territories', TG: 'Togo',
  TH: 'Thailand', TJ: 'Tajikistan', TK: 'Tokelau', TL: 'Timor-Leste', TM: 'Turkmenistan', TN: 'Tunisia',
  TO: 'Tonga', TR: 'Turkey', TT: 'Trinidad and Tobago', TV: 'Tuvalu', TW: 'Taiwan', TZ: 'Tanzania',
  UA: 'Ukraine', UG: 'Uganda', UM: 'United States Minor Outlying Islands', US: 'United States',
  UY: 'Uruguay', UZ: 'Uzbekistan',
  VA: 'Vatican City', VC: 'Saint Vincent and the Grenadines', VE: 'Venezuela', VG: 'British Virgin Islands',
  VI: 'United States Virgin Islands', VN: 'Vietnam', VU: 'Vanuatu',
  WF: 'Wallis and Futuna', WS: 'Samoa',
  YE: 'Yemen', YT: 'Mayotte',
  ZA: 'South Africa', ZM: 'Zambia', ZW: 'Zimbabwe',
}

function countryName(code) {
  if (!code) return null
  const upper = code.trim().toUpperCase()
  return COUNTRY_NAMES[upper] || code
}

const waterBodies = [
  { name: 'Pacific Ocean', lat: 0, lng: -160 },
  { name: 'Atlantic Ocean', lat: 30, lng: -40 },
  { name: 'Indian Ocean', lat: -20, lng: 75 },
  { name: 'Southern Ocean', lat: -65, lng: 0 },
  { name: 'Arctic Ocean', lat: 85, lng: 0 },
  { name: 'Mediterranean Sea', lat: 35, lng: 18 },
  { name: 'Red Sea', lat: 20, lng: 38 },
  { name: 'Arabian Sea', lat: 15, lng: 65 },
  { name: 'South China Sea', lat: 12, lng: 114 },
  { name: 'East China Sea', lat: 29, lng: 125 },
  { name: 'Caribbean Sea', lat: 15, lng: -75 },
  { name: 'North Sea', lat: 56.5, lng: 3.5 },
  { name: 'Baltic Sea', lat: 58, lng: 19 },
  { name: 'Black Sea', lat: 43, lng: 35 },
  { name: 'Caspian Sea', lat: 42, lng: 51 },
  { name: 'Sea of Japan', lat: 40, lng: 135 },
  { name: 'Yellow Sea', lat: 36, lng: 123 },
  { name: 'Persian Gulf', lat: 27, lng: 51 },
  { name: 'Gulf of Mexico', lat: 25, lng: -90 },
  { name: 'Gulf of Aden', lat: 12.5, lng: 47 },
  { name: 'Java Sea', lat: -5, lng: 111 },
  { name: 'Sulu Sea', lat: 8, lng: 120 },
  { name: 'Celebes Sea', lat: 3, lng: 122 },
  { name: 'Tasman Sea', lat: -40, lng: 160 },
  { name: 'Bering Sea', lat: 58, lng: -178 },
  { name: 'Sea of Okhotsk', lat: 55, lng: 150 },
  { name: 'Adriatic Sea', lat: 43, lng: 15 },
  { name: 'Aegean Sea', lat: 38.5, lng: 25 },
  { name: 'Ionian Sea', lat: 38, lng: 18.5 },
  { name: 'Strait of Malacca', lat: 2.5, lng: 101 },
  { name: 'Strait of Hormuz', lat: 26.6, lng: 56.3 },
  { name: 'Suez Canal', lat: 30.6, lng: 32.3 },
  { name: 'Panama Canal', lat: 9.08, lng: -79.68 },
  { name: 'Strait of Gibraltar', lat: 35.95, lng: -5.6 },
  { name: 'Bosphorus & Dardanelles', lat: 41.1, lng: 29.05 },
  { name: 'Bab-el-Mandeb', lat: 12.6, lng: 43.4 },
  { name: 'English Channel', lat: 49.8, lng: -1.5 },
  { name: 'Danish Straits', lat: 56.5, lng: 11 },
  { name: 'Strait of Taiwan', lat: 24, lng: 119.5 },
  { name: 'Sunda Strait', lat: -6, lng: 105.9 },
  { name: 'Lombok Strait', lat: -8.5, lng: 115.7 },
  { name: 'Northern Sea Route', lat: 76, lng: 100 },
  { name: 'Northwest Passage', lat: 74, lng: -95 },
  { name: 'Cape of Good Hope Route', lat: -34.5, lng: 18.5 },
  { name: 'Cape Horn Route', lat: -56, lng: -67 },
  { name: 'Great Lakes', lat: 45, lng: -83 },
  { name: 'Lake Victoria', lat: -1, lng: 33 },
  { name: 'Lake Baikal', lat: 53.5, lng: 108 },
  { name: 'Lake Titicaca', lat: -15.9, lng: -69.3 },
  { name: 'Lake Malawi', lat: -12, lng: 34.5 },
  { name: 'Lake Nicaragua', lat: 11.6, lng: -85.3 },
  { name: 'Lake Tanganyika', lat: -6.5, lng: 29.5 },
  { name: 'Lake Chad', lat: 13.2, lng: 14.2 },
  { name: 'Ligurian Sea', lat: 43.5, lng: 9 },
  { name: 'Tyrrhenian Sea', lat: 40, lng: 12 },
  { name: 'Balearic Sea', lat: 40, lng: 2.5 },
  { name: 'Alboran Sea', lat: 36, lng: -3.5 },
  { name: 'Sea of Marmara', lat: 40.7, lng: 28 },
  { name: 'Norwegian Sea', lat: 68, lng: 2 },
  { name: 'Greenland Sea', lat: 75, lng: -5 },
  { name: 'Irish Sea', lat: 53.5, lng: -5 },
  { name: 'Celtic Sea', lat: 50, lng: -8 },
  { name: 'White Sea', lat: 65.5, lng: 38 },
  { name: 'Barents Sea', lat: 75, lng: 40 },
  { name: 'Wadden Sea', lat: 53.4, lng: 6 },
  { name: 'Gulf of Suez', lat: 28.5, lng: 33 },
  { name: 'Gulf of Aqaba', lat: 29, lng: 34.7 },
  { name: 'Gulf of Oman', lat: 24.5, lng: 58.5 },
  { name: 'Mozambique Channel', lat: -18, lng: 42 },
  { name: 'Gulf of Thailand', lat: 10, lng: 101 },
  { name: 'Gulf of Tonkin', lat: 19.5, lng: 107.5 },
  { name: 'Andaman Sea', lat: 10, lng: 96 },
  { name: 'Timor Sea', lat: -11, lng: 127 },
  { name: 'Arafura Sea', lat: -9, lng: 133 },
  { name: 'Banda Sea', lat: -5, lng: 128 },
  { name: 'Flores Sea', lat: -7.5, lng: 121 },
  { name: 'Molucca Sea', lat: 1, lng: 125 },
  { name: 'Ceram Sea', lat: -2.5, lng: 129 },
  { name: 'Philippine Sea', lat: 18, lng: 135 },
  { name: 'Coral Sea', lat: -18, lng: 152 },
  { name: 'Bay of Bengal', lat: 15, lng: 88 },
  { name: 'Laccadive Sea', lat: 10, lng: 73 },
  { name: 'Gulf of California', lat: 27.5, lng: -111.5 },
  { name: 'Gulf of St. Lawrence', lat: 48, lng: -62 },
  { name: 'Labrador Sea', lat: 58, lng: -55 },
  { name: 'Beaufort Sea', lat: 72, lng: -140 },
  { name: 'Chukchi Sea', lat: 69, lng: -170 },
  { name: 'Hudson Bay', lat: 60, lng: -85 },
  { name: 'Sargasso Sea', lat: 30, lng: -60 },
  { name: 'Bay of Biscay', lat: 45, lng: -4 },
  { name: 'San Francisco Bay', lat: 37.8, lng: -122.3 },
  { name: 'Chesapeake Bay', lat: 38, lng: -76.2 },
  { name: 'Delaware Bay', lat: 39, lng: -75.2 },
  { name: 'Korea Strait', lat: 34.5, lng: 129 },
  { name: 'Yucatan Channel', lat: 21.5, lng: -85.5 },
  { name: 'Windward Passage', lat: 20, lng: -74 },
  { name: 'Mona Passage', lat: 18.3, lng: -67.8 },
  { name: 'Strait of Messina', lat: 38.2, lng: 15.6 },
  { name: 'Strait of Otranto', lat: 40, lng: 19 },
  { name: 'Kerch Strait', lat: 45.3, lng: 36.5 },
  { name: 'Strait of Juan de Fuca', lat: 48.3, lng: -124 },
  { name: 'Bonifacio Strait', lat: 41.4, lng: 9.2 },
  { name: 'Torres Strait', lat: -10.5, lng: 142.2 },
  { name: 'Sea of Azov', lat: 46, lng: 36.5 },
]

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function bearingCompass(lat1, lng1, lat2, lng2) {
  const toRad = (d) => d * Math.PI / 180
  const y = Math.sin(toRad(lng2 - lng1)) * Math.cos(toRad(lat2))
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lng2 - lng1))
  const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
  const directions = [
    'north', 'north-northeast', 'northeast', 'east-northeast',
    'east', 'east-southeast', 'southeast', 'south-southeast',
    'south', 'south-southwest', 'southwest', 'west-southwest',
    'west', 'west-northwest', 'northwest', 'north-northwest',
  ]
  return directions[Math.round(bearing / 22.5) % 16]
}

function computeCongestion(port, ships) {
  const nearby = ships.filter((s) => {
    if (s.status === 'moving') return false
    return haversineKm(port.lat, port.lng, s.lat, s.lng) <= 15
  })
  const count = nearby.length
  const docked = nearby.filter((s) => s.status === 'anchored-port').length
  const level = count >= 6 ? 'high' : count >= 3 ? 'medium' : 'low'
  return { count, level, docked }
}

function sortedByDistance(list, ship) {
  if (!list || !list.length || !ship) return []
  return list
    .map((item) => ({
      ...item,
      distanceKm: haversineKm(ship.lat, ship.lng, item.lat, item.lng),
      direction: bearingCompass(ship.lat, ship.lng, item.lat, item.lng),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
}

function nearestOf(list, ship) {
  if (!list || !list.length || !ship) return null
  let best = null
  let bestDist = Infinity
  for (const item of list) {
    const d = haversineKm(ship.lat, ship.lng, item.lat, item.lng)
    if (d < bestDist) {
      bestDist = d
      best = item
    }
  }
  if (!best) return null
  return {
    ...best,
    distanceKm: bestDist,
    direction: bearingCompass(ship.lat, ship.lng, best.lat, best.lng),
  }
}

function markerSVG(kind) {
  if (kind === 'lighthouse') {
    return `<svg width="14" height="14" viewBox="0 0 24 24">
      <path d="M12 2 L18 22 L6 22 Z" fill="#f2c94c" stroke="#0a1420" stroke-width="1"/>
    </svg>`
  }
  if (kind === 'shipyard') {
    return `<svg width="14" height="14" viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" fill="none" stroke="#f0b429" stroke-width="2"/>
      <line x1="4" y1="4" x2="20" y2="20" stroke="#f0b429" stroke-width="2"/>
    </svg>`
  }
  if (kind === 'recycling') {
    return `<svg width="14" height="14" viewBox="0 0 24 24">
      <polygon points="12,3 21,19 3,19" fill="none" stroke="#4caf6d" stroke-width="2"/>
    </svg>`
  }
  if (kind === 'bunker') {
    return `<svg width="14" height="14" viewBox="0 0 24 24">
      <rect x="6" y="4" width="10" height="16" fill="none" stroke="#ff8c42" stroke-width="2"/>
      <line x1="6" y1="10" x2="16" y2="10" stroke="#ff8c42" stroke-width="2"/>
    </svg>`
  }
  if (kind === 'drydock') {
    return `<svg width="14" height="14" viewBox="0 0 24 24">
      <rect x="4" y="6" width="16" height="12" fill="none" stroke="#f472b6" stroke-width="2"/>
      <line x1="4" y1="6" x2="20" y2="6" stroke="#f472b6" stroke-width="2" stroke-dasharray="3,2"/>
    </svg>`
  }
  if (kind === 'wetdock') {
    return `<svg width="14" height="14" viewBox="0 0 24 24">
      <rect x="4" y="6" width="16" height="12" fill="none" stroke="#38bdf8" stroke-width="2"/>
      <path d="M6 12 Q9 10 12 12 T18 12" fill="none" stroke="#38bdf8" stroke-width="1.5"/>
    </svg>`
  }
  return `<svg width="16" height="16" viewBox="0 0 24 24">
    <circle cx="12" cy="6" r="3" fill="none" stroke="#7f95a8" stroke-width="2"/>
    <path d="M12 9 L12 20 M6 14 A6 7 0 0 0 12 20 A6 7 0 0 0 18 14"
      fill="none" stroke="#7f95a8" stroke-width="2"/>
  </svg>`
}

const shipTextureCache = {}
function getShipTexture(shape, color) {
  const key = `${shape}-${color}`
  if (shipTextureCache[key]) return shipTextureCache[key]

  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = color

  if (shape === 'arrow') {
    ctx.beginPath()
    ctx.moveTo(size / 2, 4)
    ctx.lineTo(size - 10, size - 10)
    ctx.lineTo(size / 2, size - 22)
    ctx.lineTo(10, size - 10)
    ctx.closePath()
    ctx.fill()
  } else {
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2 - 6, 0, Math.PI * 2)
    ctx.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  shipTextureCache[key] = texture
  return texture
}

function App() {
  const globeRef = useRef()
  const [selectedShip, setSelectedShip] = useState(null)
  const [selectedFacility, setSelectedFacility] = useState(null)
  const [ships, setShips] = useState([])
  const [countries, setCountries] = useState([])
  const [countryLabels, setCountryLabels] = useState([])
  const [rivers, setRivers] = useState([])
  const [riverLabels, setRiverLabels] = useState([])
  const [ports, setPorts] = useState([])
  const [shipWeather, setShipWeather] = useState(null)
  const [weatherError, setWeatherError] = useState(false)
  const [portRank, setPortRank] = useState(0)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const [chatLoading, setChatLoading] = useState(false)
  const [highlightedShipNames, setHighlightedShipNames] = useState([])
  const [visibleLayers, setVisibleLayers] = useState({
    port: false,
    lighthouse: false,
    shipyard: false,
    recycling: false,
    bunker: false,
    drydock: false,
    wetdock: false,
    congestion: false,
  })

  useEffect(() => {
    const loadShips = () => {
      fetch('http://127.0.0.1:8000/ships')
        .then((res) => res.json())
        .then((data) => setShips(data))
        .catch((err) => console.error('Failed to load ships:', err))
    }

    loadShips()
    const interval = setInterval(loadShips, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetch('https://unpkg.com/world-atlas/countries-110m.json')
      .then((res) => res.json())
      .then((topology) => {
        const geo = feature(topology, topology.objects.countries)
        setCountries(geo.features)

        const labels = geo.features
          .filter((f) => f.properties?.name)
          .map((f) => {
            const [lng, lat] = geoCentroid(f)
            return { name: f.properties.name, lat, lng, kind: 'country' }
          })
        setCountryLabels(labels)
      })
      .catch((err) => console.error('Failed to load country borders:', err))
  }, [])

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_rivers_lake_centerlines.geojson')
      .then((res) => res.json())
      .then((geo) => {
        const paths = []
        const labels = []
        const seenNames = new Set()

        geo.features.forEach((f) => {
          const name = f.properties?.name
          const geom = f.geometry
          if (!geom) return

          const lineStrings = geom.type === 'MultiLineString' ? geom.coordinates : [geom.coordinates]

          lineStrings.forEach((coords) => {
            if (!coords || coords.length < 2) return
            paths.push(coords.map(([lng, lat]) => [lat, lng]))

            if (name && !seenNames.has(name)) {
              seenNames.add(name)
              const mid = coords[Math.floor(coords.length / 2)]
              labels.push({ name, lat: mid[1], lng: mid[0], kind: 'river' })
            }
          })
        })

        setRivers(paths)
        setRiverLabels(labels)
      })
      .catch((err) => console.error('Failed to load rivers:', err))
  }, [])

  useEffect(() => {
    fetch('https://services2.arcgis.com/jUpNdisbWqRpMo35/ArcGIS/rest/services/WPI_Ports2017/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=true&f=geojson&resultRecordCount=4000')
      .then((res) => res.json())
      .then((geo) => {
        const loaded = (geo.features || [])
          .filter((f) => f.geometry && f.geometry.coordinates)
          .map((f) => {
            const props = f.properties || {}
            const name =
              props.PORT_NAME || props.PORTNAME || props.NAME ||
              props.Name || props.name || 'Unknown Port'
            const country = props.COUNTRY || props.Country || props.country || null
            const [lng, lat] = f.geometry.coordinates
            return { name, lat, lng, kind: 'port', country }
          })
        setPorts(loaded)
      })
      .catch((err) => console.error('Failed to load World Port Index:', err))
  }, [])

  useEffect(() => {
    setPortRank(0)
  }, [selectedShip])

  function sendChatMessage() {
    const question = chatInput.trim()
    if (!question || chatLoading) return

    setChatMessages((prev) => [...prev, { role: 'user', text: question }])
    setChatInput('')
    setChatLoading(true)

    fetch('http://127.0.0.1:8000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: question }),
    })
      .then((res) => res.json())
      .then((data) => {
        setChatMessages((prev) => [...prev, { role: 'assistant', text: data.reply }])
        const names = (data.ships || []).map((s) => s.name)
        const isPartial = (data.count ?? names.length) > names.length
        setHighlightedShipNames(isPartial ? [] : names)
      })
      .catch(() => {
        setChatMessages((prev) => [...prev, { role: 'assistant', text: 'Something went wrong reaching the chat backend.' }])
      })
      .finally(() => setChatLoading(false))
  }
  useEffect(() => {
    if (!selectedShip) {
      setShipWeather(null)
      setWeatherError(false)
      return
    }

    setShipWeather(null)
    setWeatherError(false)

    const { lat, lng } = selectedShip
    fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&hourly=wave_height,wind_wave_height&timezone=UTC`)
      .then((res) => {
        if (!res.ok) throw new Error('marine data unavailable')
        return res.json()
      })
      .then((data) => {
        const waveHeight = data?.hourly?.wave_height?.[0]
        if (waveHeight == null) throw new Error('no wave data at this point')
        setShipWeather({ waveHeight })
      })
      .catch(() => setWeatherError(true))
  }, [selectedShip])

  function buildShipMarker(d) {
    const color = d.is_dark_flagged
      ? '#ff3b3b'
      : d.status === 'moving' ? '#3fd9c7' :
        d.status === 'anchored-port' ? '#4a90d9' : '#e07b3f'

    const group = new THREE.Group()
    group.userData = d

    const shape = d.status === 'moving' ? 'arrow' : 'circle'
    const isDimmed =
      (selectedShip && d.name !== selectedShip.name) ||
      (highlightedShipNames.length > 0 && !highlightedShipNames.includes(d.name))
      const material = new THREE.SpriteMaterial({
      map: getShipTexture(shape, color),
      rotation: shape === 'arrow' ? THREE.MathUtils.degToRad(d.heading ?? 0) : 0,
      sizeAttenuation: false,
      transparent: true,
      opacity: isDimmed ? 0.0001 : 1,
    })
    const sprite = new THREE.Sprite(material)
    sprite.userData = d
    sprite.scale.set(0.008, 0.008, 1)
    group.add(sprite)

    return group
  }

  const textLabels = [
    ...waterBodies.map((w) => ({ ...w, kind: 'water' })),
    ...countryLabels,
    ...riverLabels,
  ]

  const layerData = {
    port: ports,
    lighthouse: lighthouses,
    shipyard: shipyards,
    recycling: shipRecyclingYards,
    bunker: bunkeringStations,
    drydock: dryDocks,
    wetdock: wetDocks,
  }

  const toggledMarkers = Object.entries(visibleLayers)
    .filter(([key, on]) => on && key !== 'congestion')
    .flatMap(([key]) => layerData[key])

  const trackedPorts = ports.filter((p) => p.lat >= 49 && p.lat <= 54 && p.lng >= -2 && p.lng <= 9)
  const portCongestionMarkers = visibleLayers.congestion
    ? trackedPorts.map((p) => {
        const { count, level } = computeCongestion(p, ships)
        return { name: p.name, lat: p.lat, lng: p.lng, kind: 'congestion', level, count }
      })
    : []

  const sortedPorts = selectedShip ? sortedByDistance(ports, selectedShip) : []
  const candidatePort = sortedPorts[portRank] || null
  const candidateCongestion = candidatePort ? computeCongestion(candidatePort, ships) : null
  const visitedPorts = sortedPorts.slice(0, portRank + 1)
  const nearestPort = selectedShip ? nearestOf(ports, selectedShip) : null
  const nearestLighthouse = selectedShip ? nearestOf(lighthouses, selectedShip) : null
  const nearestShipyard = selectedShip ? nearestOf(shipyards, selectedShip) : null
  const nearestRecycling = selectedShip ? nearestOf(shipRecyclingYards, selectedShip) : null
  const nearestBunker = selectedShip ? nearestOf(bunkeringStations, selectedShip) : null
  const nearestDrydock = selectedShip ? nearestOf(dryDocks, selectedShip) : null
  const nearestWetdock = selectedShip ? nearestOf(wetDocks, selectedShip) : null

  const nearbyMarkers = [
    ...visitedPorts, nearestLighthouse, nearestShipyard,
    nearestRecycling, nearestBunker,
    nearestDrydock, nearestWetdock,
  ].filter(Boolean)

  const seen = new Map()
  for (const m of [...toggledMarkers, ...nearbyMarkers, ...portCongestionMarkers]) {
    seen.set(`${m.name}-${m.lat}-${m.lng}`, m)
  }
  const facilityMarkers = Array.from(seen.values())

  return (
    <div style={{ position: 'relative' }}>
      <Globe
        ref={globeRef}
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        globeMaterial={new THREE.MeshBasicMaterial({ color: '#18293a'})}

        polygonsData={countries}
        polygonCapColor={() => 'rgba(0, 0, 0, 0)'}
        polygonSideColor={() => 'rgba(0, 0, 0, 0)'}
        polygonAltitude={0}
        polygonStrokeColor={() => '#3fd9c7'}

        pathsData={rivers}
        pathColor={() => '#4a90d9'}
        pathStroke={0.3}
        pathPointAlt={() => 0.001}

        objectsData={ships}
        objectLat="lat"
        objectLng="lng"
        objectAltitude={0.001}
        objectThreeObject={buildShipMarker}
        onObjectClick={(obj) => { setSelectedShip(obj); setHighlightedShipNames([]) }}
        objectsTransitionDuration={0}

        htmlElementsData={[...facilityMarkers, ...textLabels]}
        htmlLat="lat"
        htmlLng="lng"
        htmlElement={(d) => {
          const el = document.createElement('div')
          const labelKinds = ['water', 'country', 'river']
          el.style.pointerEvents = labelKinds.includes(d.kind) ? 'none' : 'auto'

          if (d.kind === 'water') {
            el.innerHTML = d.name
            el.style.color = 'rgba(150, 170, 190, 0.55)'
            el.style.fontFamily = "Georgia, 'Times New Roman', serif"
            el.style.fontStyle = 'italic'
            el.style.fontSize = '10px'
            el.style.letterSpacing = '0.04em'
            el.style.whiteSpace = 'nowrap'
          } else if (d.kind === 'country') {
            el.innerHTML = d.name
            el.style.color = 'rgba(200, 215, 225, 0.65)'
            el.style.fontFamily = "'IBM Plex Sans', system-ui, sans-serif"
            el.style.fontSize = '8px'
            el.style.letterSpacing = '0.02em'
            el.style.whiteSpace = 'nowrap'
            el.style.textTransform = 'uppercase'
          } else if (d.kind === 'river') {
            el.innerHTML = d.name
            el.style.color = 'rgba(74, 144, 217, 0.6)'
            el.style.fontFamily = "Georgia, 'Times New Roman', serif"
            el.style.fontStyle = 'italic'
            el.style.fontSize = '8px'
            el.style.whiteSpace = 'nowrap'
          } else if (d.kind === 'congestion') {
            const color = d.level === 'high' ? '#ff3b3b' : d.level === 'medium' ? '#f0b429' : '#4caf6d'
            el.title = `${d.name} — ${d.level} congestion (${d.count} ships)`
            el.style.cursor = 'pointer'
            el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="${color}" stroke="#0a1420" stroke-width="1.5"/></svg>`
            el.addEventListener('click', (e) => {
              e.stopPropagation()
              setSelectedFacility(d)
            })
          } else {
            el.title = d.name
            el.style.cursor = 'pointer'
                        const visitedIndex = d.kind === 'port'
              ? visitedPorts.findIndex((p) => p.name === d.name && p.lat === d.lat && p.lng === d.lng)
              : -1
            if (visitedIndex !== -1) {
              el.style.position = 'relative'
              el.innerHTML = `
                <div style="position:absolute; bottom:100%; left:50%; transform:translateX(-50%); margin-bottom:-12px; font-size:10px; font-weight:600; color:#3fd9c7; font-family:'IBM Plex Mono', monospace; white-space:nowrap;">${visitedIndex + 1}</div>
                ${markerSVG(d.kind)}
              `
            } else {
              el.innerHTML = markerSVG(d.kind)
            }
            el.addEventListener('click', (e) => {
              e.stopPropagation()
              setSelectedFacility(d)
            })
          }

          return el
        }}
      />

      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        width: 220,
        background: '#0d1620',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(63, 217, 199, 0.3)',
        borderRadius: 8,
        padding: '16px 20px',
        color: '#e8edf2',
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        fontSize: 13,
      }}>
        <h4 style={{ margin: '0 0 12px', fontSize: 12, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#3fd9c7' }}>
          Map Layers
        </h4>
        {[
          { key: 'port', label: 'Ports / Harbours' },
          { key: 'lighthouse', label: 'Lighthouses' },
          { key: 'shipyard', label: 'Shipyards' },
          { key: 'recycling', label: 'Ship Recycling Yards' },
          { key: 'bunker', label: 'Bunkering Stations' },
          { key: 'drydock', label: 'Dry Docks' },
          { key: 'wetdock', label: 'Wet Docks' },
          { key: 'congestion', label: 'Port Congestion (Live)' },
        ].map((layer) => (
          <label key={layer.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={visibleLayers[layer.key]}
              onChange={() => setVisibleLayers((prev) => ({ ...prev, [layer.key]: !prev[layer.key] }))}
              style={{ accentColor: '#3fd9c7' }}
            />
            {layer.label}
          </label>
        ))}
      </div>

      {selectedShip && (
        <div style={{
          position: 'absolute',
          top: 20,
          right: 20,
          width: 300,
          background: '#0d1620',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(63, 217, 199, 0.3)',
          borderLeft: `3px solid ${selectedShip.is_dark_flagged ? '#ff3b3b' : '#3fd9c7'}`,
          borderRadius: 8,
          padding: '20px 24px',
          color: '#e8edf2',
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          boxShadow: '0 0 24px rgba(63, 217, 199, 0.15)',
        }}>
          <button
            onClick={() => setSelectedShip(null)}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'none',
              border: 'none',
              color: '#7f95a8',
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>

          <h3 style={{ margin: '0 0 4px', fontSize: 18, letterSpacing: '-0.01em', textAlign: 'center' }}>
            {selectedShip.name}
          </h3>
          <p style={{ margin: '0 0 16px', color: '#3fd9c7', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
            {selectedShip.type}
          </p>

          {selectedShip.is_dark_flagged && (
            <div style={{
              background: 'rgba(255, 59, 59, 0.12)',
              border: '1px solid rgba(255, 59, 59, 0.4)',
              borderRadius: 6,
              padding: '10px 12px',
              marginBottom: 16,
              fontSize: 12,
              lineHeight: 1.5,
            }}>
              <div style={{ color: '#ff3b3b', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: 11 }}>
                ⚠ Dark Fleet Alert
              </div>
              <div style={{ color: '#e8edf2' }}>{selectedShip.dark_flag_reason}</div>
            </div>
          )}

          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, lineHeight: 1.9, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#7f95a8' }}>Type</span><span>{selectedShip.vessel_type ?? 'unknown'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#7f95a8' }}>Status</span><span>{selectedShip.status}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#7f95a8' }}>Speed</span><span>{selectedShip.speed} kn</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#7f95a8' }}>Heading</span><span>{selectedShip.heading}°</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#7f95a8' }}>Last update</span>
              <span>{selectedShip.minutes_since_update ?? 0} min ago</span>
            </div>
            {shipWeather && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#7f95a8' }}>Wave height</span>
                <span>{shipWeather.waveHeight} m</span>
              </div>
            )}
          </div>
          {weatherError && (
            <p style={{ color: '#7f95a8', fontSize: 11, marginTop: -8, marginBottom: 12 }}>
              No marine weather data (inland or unavailable)
            </p>
          )}

          <div style={{ fontSize: 12, lineHeight: 1.6, borderTop: '1px solid rgba(63, 217, 199, 0.2)', paddingTop: 10 }}>
            {candidatePort && (
              <div style={{ marginBottom: 6 }}>
                <div>
                  <span style={{ color: '#7f95a8' }}>{portRank === 0 ? 'Nearest Port' : `Alternative Port #${portRank}`}: </span>
                  {candidatePort.name} ({candidatePort.distanceKm.toFixed(1)} km) towards {candidatePort.direction}
                </div>
                {candidateCongestion && (
                  <div style={{ marginTop: 2 }}>
                    <span style={{ color: '#7f95a8' }}>Congestion: </span>
                    <strong style={{
                      color: candidateCongestion.level === 'high' ? '#ff3b3b' : candidateCongestion.level === 'medium' ? '#f0b429' : '#4caf6d',
                      textTransform: 'uppercase',
                    }}>
                      {candidateCongestion.level}
                    </strong>
                    {' '}({candidateCongestion.count} anchored nearby, {candidateCongestion.docked} docked)
                  </div>
                )}
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  {portRank > 0 && (
                    <button
                      onClick={() => setPortRank((r) => r - 1)}
                      style={{
                        background: 'rgba(63, 217, 199, 0.1)',
                        border: '1px solid rgba(63, 217, 199, 0.4)',
                        borderRadius: 4,
                        color: '#3fd9c7',
                        fontSize: 11,
                        padding: '4px 8px',
                        cursor: 'pointer',
                      }}
                    >
                      ← Previous port
                    </button>
                  )}
                  {portRank < sortedPorts.length - 1 && (
                    <button
                      onClick={() => setPortRank((r) => r + 1)}
                      style={{
                        background: 'rgba(63, 217, 199, 0.1)',
                        border: '1px solid rgba(63, 217, 199, 0.4)',
                        borderRadius: 4,
                        color: '#3fd9c7',
                        fontSize: 11,
                        padding: '4px 8px',
                        cursor: 'pointer',
                      }}
                    >
                      Check another port →
                    </button>
                  )}
                </div>
              </div>
            )}
            {nearestLighthouse && (
              <div style={{ marginBottom: 6 }}>
                <span style={{ color: '#7f95a8' }}>Nearest Lighthouse: </span>
                {nearestLighthouse.name} ({nearestLighthouse.distanceKm.toFixed(1)} km) towards {nearestLighthouse.direction}
              </div>
            )}
            {nearestShipyard && (
              <div style={{ marginBottom: 6 }}>
                <span style={{ color: '#7f95a8' }}>Nearest Shipyard: </span>
                {nearestShipyard.name} ({nearestShipyard.distanceKm.toFixed(1)} km) towards {nearestShipyard.direction}
              </div>
            )}
            {nearestRecycling && (
              <div style={{ marginBottom: 6 }}>
                <span style={{ color: '#7f95a8' }}>Nearest Recycling Yard: </span>
                {nearestRecycling.name} ({nearestRecycling.distanceKm.toFixed(1)} km) towards {nearestRecycling.direction}
              </div>
            )}
            {nearestBunker && (
              <div style={{ marginBottom: 6 }}>
                <span style={{ color: '#7f95a8' }}>Nearest Bunkering Station: </span>
                {nearestBunker.name} ({nearestBunker.distanceKm.toFixed(1)} km) towards {nearestBunker.direction}
              </div>
            )}
            {nearestDrydock && (
              <div style={{ marginBottom: 6 }}>
                <span style={{ color: '#7f95a8' }}>Nearest Dry Dock: </span>
                {nearestDrydock.name} ({nearestDrydock.distanceKm.toFixed(1)} km) towards {nearestDrydock.direction}
              </div>
            )}
            {nearestWetdock && (
              <div style={{ marginBottom: 0 }}>
                <span style={{ color: '#7f95a8' }}>Nearest Wet Dock: </span>
                {nearestWetdock.name} ({nearestWetdock.distanceKm.toFixed(1)} km) towards {nearestWetdock.direction}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedFacility && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          width: 280,
          background: '#0d1620',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(63, 217, 199, 0.3)',
          borderLeft: '3px solid #3fd9c7',
          borderRadius: 8,
          padding: '20px 24px',
          color: '#e8edf2',
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          boxShadow: '0 0 24px rgba(63, 217, 199, 0.15)',
        }}>
          <button
            onClick={() => setSelectedFacility(null)}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'none',
              border: 'none',
              color: '#7f95a8',
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>

          <h3 style={{ margin: '0 0 4px', fontSize: 18, letterSpacing: '-0.01em' }}>
            {selectedFacility.name}
          </h3>
          <p style={{ margin: '0 0 12px', color: '#3fd9c7', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {kindLabels[selectedFacility.kind] || 'Location'}
          </p>

          {selectedFacility.country && (
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, marginBottom: 10 }}>
              <span style={{ color: '#7f95a8' }}>Country: </span>{countryName(selectedFacility.country)}
            </div>
          )}
          {selectedFacility.kind === 'port' && (() => {
            const { count, docked, level } = computeCongestion(selectedFacility, ships)
            return (
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: 1.8, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#7f95a8' }}>Docked (live)</span><span>{docked}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#7f95a8' }}>Nearby traffic</span><span>{count} ships</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#7f95a8' }}>Congestion</span>
                  <strong style={{
                    color: level === 'high' ? '#ff3b3b' : level === 'medium' ? '#f0b429' : '#4caf6d',
                    textTransform: 'uppercase',
                  }}>{level}</strong>
                </div>
              </div>
            )
          })()}
          {selectedFacility.kind === 'congestion' ? (
            <p style={{ fontSize: 12, lineHeight: 1.5, color: '#c7d2dc', margin: 0 }}>
              {selectedFacility.count} ship(s) currently anchored within 15km — classified as{' '}
              <strong style={{ textTransform: 'uppercase' }}>{selectedFacility.level}</strong> congestion.
              This is a live estimate from currently tracked AIS data, not a historical forecast.
            </p>
          ) : selectedFacility.note && (
            <p style={{ fontSize: 12, lineHeight: 1.5, color: '#c7d2dc', margin: 0 }}>
              {selectedFacility.note}
            </p>
          )}
          {selectedFacility.distanceKm != null && (
            <p style={{ fontSize: 12, color: '#7f95a8', marginTop: 10, marginBottom: 0 }}>
              {selectedFacility.distanceKm.toFixed(1)} km from selected ship
            </p>
          )}
        </div>
      )}
      {chatOpen && (
        <div style={{
          position: 'absolute',
          bottom: 90,
          right: 20,
          width: 320,
          height: 420,
          background: '#0d1620',
          border: '1px solid rgba(63, 217, 199, 0.3)',
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          boxShadow: '0 0 24px rgba(63, 217, 199, 0.15)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid rgba(63, 217, 199, 0.2)',
            color: '#3fd9c7',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
          }}>
            Fleet Assistant
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            {chatMessages.length === 0 && (
              <p style={{ color: '#7f95a8', fontSize: 12, lineHeight: 1.5 }}>
                Ask about the live fleet — e.g. "how many tankers are moving?" or "any ships flagged as dark fleet?"
              </p>
            )}
            {chatMessages.map((m, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 10,
                  textAlign: m.role === 'user' ? 'right' : 'left',
                }}
              >
                <div style={{
                  display: 'inline-block',
                  maxWidth: '85%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  lineHeight: 1.5,
                  color: '#e8edf2',
                  background: m.role === 'user' ? 'rgba(63, 217, 199, 0.15)' : 'rgba(127, 149, 168, 0.15)',
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <p style={{ color: '#7f95a8', fontSize: 12 }}>Thinking...</p>
            )}
          </div>

          <div style={{ display: 'flex', borderTop: '1px solid rgba(63, 217, 199, 0.2)' }}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendChatMessage() }}
              placeholder="Ask a question..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#e8edf2',
                padding: '10px 12px',
                fontSize: 12,
                outline: 'none',
              }}
            />
            <button
              onClick={sendChatMessage}
              style={{
                background: 'none',
                border: 'none',
                color: '#3fd9c7',
                padding: '0 14px',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setChatOpen((o) => !o)}
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#3fd9c7',
          border: 'none',
          fontSize: 22,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(63, 217, 199, 0.4)',
        }}
      >
        {chatOpen ? '✕' : '💬'}
      </button>
    </div>
  )
}

export default App
