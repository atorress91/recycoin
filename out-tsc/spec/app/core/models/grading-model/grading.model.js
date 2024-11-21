export class Grading {
    constructor() {
        this.id = 0;
        this.name = '';
        this.description = '';
        this.scope_level = 0;
        this.is_infinity = false;
        this.personal_purchases = 0;
        this.personal_purchases_exact = false;
        this.purchases_network = 0;
        this.binary_volume = 0;
        this.volume_points = 0;
        this.volume_points_network = 0;
        this.children_left_leg = 0;
        this.children_right_leg = 0;
        this.front_by_matrix = 0;
        this.front_qualif_1 = 0;
        this.front_score_1 = 0;
        this.front_qualif_2 = 0;
        this.front_score_2 = 0;
        this.front_qualif_3 = 0;
        this.front_score_3 = 0;
        this.exact_front_ratings = false;
        this.leader_by_matrix = 0;
        this.network_leaders = 0;
        this.network_leaders_qualifier = 0;
        this.products = 0;
        this.affiliations = 0;
        this.have_both = false;
        this.activate_user_by = 0;
        this.active = 0;
        this.status = 0;
        this.network_scope_level = 0;
        this.full_period = false;
        this.created_at = new Date();
        this.updated_at = new Date();
    }
}
//# sourceMappingURL=grading.model.js.map