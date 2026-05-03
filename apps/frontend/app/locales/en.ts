export default {
  header: {
    create_tournament: "Create Tournament"
  },
  navigation: {
    home: "Home",
    about: "About",
    back_to_list: "BACK TO LIST",
    tournaments: "Tournaments"
  },
  auth: {
    title: "Tournament Hub",
    login_subtitle: "Log in to your profile",
    signup_subtitle: "Create your personal profile",
    login: "Login",
    signup: "SignUp",
    login_description: "Quick login via social networks or email",
    signup_description: "Quick login or fill in your details",
    or_email: "or email",
    email: "Email *",
    password: "Password *",
    confirm_password: "Confirm Password *",
    personal_data: "Personal Data",
    full_name: "Full Name *",
    birth_date: "Birth Date",
    gender: "Gender",
    gender_select: "Select",
    gender_male: "Male",
    gender_female: "Female",
    terms_accept: "I accept the",
    terms_link: "Terms of Use",
    terms_consent: "and consent to data processing.",
    login_btn: "LOGIN",
    signup_btn: "REGISTER",
    no_account: "No account?",
    have_account: "Already have an account?",
    switch_to_signup: "Register",
    switch_to_login: "Login"
  },
  profile: {
    title: "My Profile",
    name: "Name",
    email: "Email",
    role: "Role",
    member_since: "Member Since",
    my_teams: "My Teams",
    no_teams: "You are not a member of any team yet.",
    not_specified: "Not specified",
    empty_text: "User information unavailable. Please log in.",
    logout: "Log Out",
    roles: {
      user: "User",
      admin_only: "Only administrators can verify match results.",
      cannot_verify: "Cannot verify result yet"
    },
    change_photo: "Change Photo"
  },
  footer: {
    description: "The ultimate platform for organizing, managing, and hosting competitive tournaments with ease.",
    platform: "Platform",
    tournaments: "Tournaments",
    create_tournament: "Create Tournament",
    about_us: "About Us",
    legal: "Legal",
    privacy_policy: "Privacy Policy",
    terms_of_use: "Terms of Use",
    rights_reserved: "© 2026 Star Of Ukraine. All rights reserved."
  },
  privacy: {
    title: "Privacy Policy",
    last_updated: "Last updated: {date}",
    meta_description: "Privacy policy and data usage terms for Star of Ukraine platform.",
    sections: {
      data_collection: {
        title: "1. Data Collection",
        text: "We collect minimal personal information necessary to facilitate your use of the Star of Ukraine platform. This includes information provided during registration such as your name, email address, and optional profile data like your profile picture."
      },
      data_usage: {
        title: "2. How We Use Your Data",
        text: "Your data is used exclusively to provide you with the tournament organization and participation services. We do not sell, rent, or distribute your personal information to third parties."
      },
      cookies: {
        title: "3. Cookies and Tracking",
        text: "We use essential cookies to maintain your active session (such as keeping you logged in) and to remember your language preferences. We do not use intrusive tracking or marketing cookies."
      },
      contact: {
        title: "4. Contact Us",
        text: "If you have any questions or concerns regarding our privacy practices, you can contact the administrative team through the support channels provided in the platform."
      }
    }
  },
  welcome: {
    title: "Star Of Ukraine",
    subtitle: "The ultimate platform for organizing, managing, and hosting competitive tournaments with ease.",
    actions: {
      view_tournaments: "View Tournaments"
    },
    features: {
      discover: {
        title: "Discover Events",
        text: "Browse our curated list of active and upcoming tournaments. Find detailed event info and the perfect competition to showcase your skills."
      },
      host: {
        title: "Host Tournaments",
        text: "Create and manage your own events effortlessly. Customize tournament details, rules, and gather participants in just a few clicks."
      },
      form_teams: {
        title: "Form Teams",
        text: "Build and manage your own squads. Create custom teams and participate in team-based tournaments together with your friends."
      }
    }
  },
  tournaments: {
    listing_title: "UPCOMING TOURNAMENTS",
    no_tournaments: "No tournaments yet.",
    load_more: "LOAD MORE",
    loading: "LOADING...",
    status: {
      planned: "PLANNED",
      registration: "REGISTRATION OPEN",
      waiting: "WAITING",
      active: "ACTIVE",
      finished: "FINISHED"
    },
    teams: {
      seed_title: "TEAM SEEDING",
      list_title: "TEAM LIST",
      hint: "Drag rows to reorder. Click 'Generate Bracket' — the bracket will appear below.",
      generate_btn: "Generate Bracket",
      shuffle_btn: "Shuffle Randomly",
      columns: {
        team: "Team",
        points: "Points"
      },
      unnamed: "Unnamed"
    },
    details: {
      about: "ABOUT TOURNAMENT",
      teams_title: "TEAMS",
      teams_hidden: "The list of teams will be available after registration ends.",
      teams_loading: "Loading teams...",
      teams_empty: "No teams added yet.",
      captain: "Captain:",
      city: "City:",
      delete_team: "Delete Team",
      create_team: "Create Team",
      actions: {
        description: "Tournament Description",
        show_bracket: "Open Bracket",
        hide_bracket: "Hide Bracket"
      },
      bracket: {
        title: "TOURNAMENT BRACKET",
        sides_title: "TEAM SIDES IN MATCHES",
        round: "Round",
        match: "Match",
        auto: "Auto",
        match_id_placeholder: "Match ID",
        calculate_result: "Calculate Result"
      },
      stats: {
        rounds: "ROUNDS",
        team_size: "PLAYERS PER TEAM",
        max_teams: "MAX TEAMS"
      },
      dates: {
        title: "KEY DATES",
        reg_start: "REGISTRATION STARTS",
        reg_end: "REGISTRATION ENDS",
        start_date: "START DATE",
        current_status: "CURRENT STATUS"
      },
      admin: {
        title: "MATCH VERIFICATION (ADMIN)",
        info: "Provide a Match ID from OpenDota for automatic result calculation and bracket progression.",
        dota_placeholder: "Example: 7678123456",
        loading_data: "LOADING DATA...",
        enter_match_id: "ENTER MATCH ID TO VERIFY",
        cancel: "CANCEL",
        confirm: "CONFIRM RESULT",
        find_btn: "Find",
        searching: "Searching...",
        winner: "WINNER",
        duration: "DURATION",
        match_not_found: "Match not found or API error",
        radiant_win: "Radiant Victory",
        dire_win: "Dire Victory",
        radiant: "Radiant",
        dire: "Dire"
      },
      delete_tournament: "Delete Tournament",
      not_found: "Tournament not found."
    },
    filters: {
      all: "All",
      byDate: "By Date",
      byName: "By Name",
      byMaxTeams: "Teams Count",
      byTeamSizeMin: "Min. Size",
      byTeamSizeMax: "Max. Size",
      byRounds: "Rounds",
      byRegistrationStart: "Reg. Start",
      byRegistrationEnd: "Reg. End"
    }
  },
  modals: {
    create: {
      title: "Create Tournament",
      name_label: "Tournament Name",
      name_placeholder: "Enter tournament name",
      desc_label: "Description & Rules",
      desc_placeholder: "Enter description and rules",
      start_date: "Tournament Start Date",
      reg_start: "Registration Start",
      reg_end: "Registration End",
      rounds_label: "Number of Rounds",
      rounds_placeholder: "Rounds",
      max_teams_label: "Max Teams (Optional)",
      max_teams_placeholder: "Teams",
      min_players: "Min. Players",
      max_players: "Max. Players",
      min_placeholder: "Min.",
      max_placeholder: "Max.",
      hide_teams: "Hide teams until registration ends",
      creating: "Creating...",
      create_btn: "Create Tournament",
      error_creating: "An error occurred while creating the tournament."
    },
    delete: {
      title: "Delete Tournament",
      warning_prefix: "You are trying to delete tournament",
      warning_suffix: ". This action is irreversible!",
      confirmation_label: "To confirm, enter the tournament name FULLY IN UPPERCASE:",
      placeholder: "TOURNAMENT NAME",
      cancel: "CANCEL",
      delete_btn: "DELETE",
      deleting: "Deleting..."
    }
  },
  about_page: {
    title: "About Project",
    description: "Star Of Ukraine is a modern esports competition platform that unites players, organizers, and jury into a single ecosystem."
  },
  common: {
    language: "Language",
    english: "English",
    ukrainian: "Ukrainian",
    search_placeholder: "Search tournaments..."
  }
}
